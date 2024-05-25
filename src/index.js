import express from "express";
import "dotenv/config";
import cors from "cors";
import multer from "multer";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler.js";
import userAuth from "./routes/userAuth.js";
import payment from "./routes/authenticated/payment.js";
import oAuth from "./routes/oAuth.js";
import connectDb from "./config/mongo.js";
import packageRoutes from "./routes/authenticated/package.js";
import verifyToken from "./middlewares/authentication.js";
import userInfo from "./routes/authenticated/user.js";
import serviceRoutes from "./routes/authenticated/service.js";
import conversation from "./routes/authenticated/conversation.js";
import { Server } from "socket.io";
import path from "path";
import UserModel from "./models/user.js";
import Chat from "./models/chat.js";
// import messageModel from "./models/message.js";
// import http from 'http'
// import Server from 'socket-io'

const app = express();
// const server = http.createServer(app)
//multer config
const upload = multer({});
app.use(upload.any());

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//cors config
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

//db connection
connectDb();

//server check
app.get("/", (req, res) => {
  res.send("server is working");
});

app.use("/auth", userAuth);
app.use("/validate-token", verifyToken, async (req, res) => {
  const userInfo = await UserModel.findById(
    req.userId,
    "name email roleType location verification status credits image joinedAt"
  );
  return res
    .status(200)
    .json({ message: "Token verified successfully", userInfo });
});

//hit this route for google authentication
app.use("/google-auth", oAuth);

app.use("/userInfo", verifyToken, userInfo);
app.use("/user/payment", verifyToken, payment);
app.use("/user/package", packageRoutes);
app.use("/user/service", serviceRoutes);
app.use("/user/chat", verifyToken, conversation);

//error handler
app.use(errorHandler);

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});

const io = new Server(server, {
  // pingTimeout: 60000,
  cors: {
    origin: process.env.FRONTEND_URL,
  },
});

// Map to store socket IDs of connected users
const connectedUsers = new Map();
const userStatus = new Map();

io.on("connection", (socket) => {
  console.log(`Socket Connected`, socket.id);


  // Store the socket ID of the connected user
  socket.on("user:connect", async(userId) => {
    connectedUsers.set(userId, socket.id);
    console.log("user is connected", userId);
    userStatus.set(userId, 'Online'); // Set user status to "Online"
    await UserModel.updateOne({_id:userId},{status:"Online"})
    
    io.emit("user_status", { userId, status: 'Online' }); // Emit status update to all clients
  
  });

  socket.on("user:leave_app", async(userId) => {
    console.log("user leave app", userId);
    connectedUsers.set(userId, socket.id);
    userStatus.set(userId, 'Offline'); // Set user status to "Online"
    await UserModel.updateOne({_id:userId},{status:"Offline"})
    io.emit("user_status", { userId, status: 'Offline' }); // Emit status update to all clients
  });

  //video calling
  socket.on("call:request", async (data) => {
    try {
      const { callerUserId, callTo, roomId } = data;
      console.log(data,"data in call requesttt");

      // Fetch user documents from MongoDB using Mongoose
      const callerUser = await UserModel.findById(callerUserId);
      const calleeUser = await UserModel.findById(callTo);
      console.log(calleeUser,"calle");

      if (!calleeUser) {
        console.log("User not found");
        return;
      }

      console.log(
        `Incoming call from ${callerUser.name} (${callerUser.email}) for room: ${roomId}`
      );

      // Get the callee user's socket ID from the connectedUsers map
      const calleeSocketId = connectedUsers.get(callTo);

      if (calleeSocketId) {
        // Emit a "call:incoming" event only to the callee user
        io.to(calleeSocketId).emit("call:incoming", {
          caller: callerUser,
          roomId,
        });
      } else {
        console.log("Callee user not connected");
      }
    } catch (error) {
      console.error("Error handling call request:", error);
    }
  });

  socket.on("call:accept", async (data) => {
    console.log("call accepted event", data);
    const { acceptedBy, callFrom, roomId } = data;
    const callerSocketId = connectedUsers.get(callFrom);
    io.to(callerSocketId).emit("call:accepted", {
      caller: callerSocketId,
      acceptedBy,
      roomId,
    });
  });

  socket.on("call:decline", async (data) => {
    console.log("call declined event", data);
    const { declinedBy, callFrom, roomId } = data;
    const callerSocketId = connectedUsers.get(callFrom);
    io.to(callerSocketId).emit("call:declined", {
      caller: callerSocketId,
      declinedBy,
      roomId,
    });
  });

  socket.on("call:leave", async (data) => {
    console.log("call leave event", data);
    const { leftBy, callWith, roomId } = data;
    const otherUserSocketId = connectedUsers.get(callWith);
    const calleeSocketId = connectedUsers.get(leftBy);
    io.to(otherUserSocketId).to(calleeSocketId).emit("call:left", {
      callWith,
      leftBy,
      roomId,
    });
  });
  const userStatus = new Map();

  //messages
  socket.on("setup", async (userInfo) => {
    socket.join(userInfo?._id);
    socket.emit("connected");
    await UserModel.findByIdAndUpdate(userInfo?._id, { status: "Online" });
    userStatus.set(userInfo?._id, "Online");
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("user joined room ", room);
  });

  socket.on("new message", (newMessageRecived) => {
    var chat = newMessageRecived.chat_id;
    if (!chat.user1 || !chat.user2) return console.log("chat user not defined");
    const senderId = newMessageRecived.sender_id._id;
    if (chat.user1._id === senderId) {
      socket.in(chat.user2._id).emit("message recieved", newMessageRecived);
    } else {
      socket.in(chat.user1._id).emit("message recieved", newMessageRecived);
    }
  });

  socket.on('clear_mesg', async (chatId) => {
    await Chat.findOneAndUpdate(
      { 
        _id: chatId, 
        "notify.message_count": { $ne: 0 }, 
        "notify.reciver_id": { $ne: null } 
      },
      { 
        $set: { 
          "notify.message_count": 0, 
          "notify.reciver_id": null 
        } 
      },
      { new: true }
    );
  });
  

  // Cleanup when user disconnects
  socket.on("disconnect", () => {
    for (const [userId, socketId] of connectedUsers) {
      if (socketId === socket.id) {
        console.log(userId,"user is disconnected");
        connectedUsers.delete(userId);
        userStatus.set(userId, 'Offline'); // Update user status to "Offline"
        io.emit("user_status", { userId, status: 'Offline' });
        break;
      }
    }
  });

});
