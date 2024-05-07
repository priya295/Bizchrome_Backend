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
    "name email roleType location verification status"
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
    origin: "http://localhost:5173",
  },
});

// Map to store socket IDs of connected users
const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log(`Socket Connected`, socket.id);

  // Store the socket ID of the connected user
  socket.on("user:connect", (userId) => {
    console.log("user is connected", userId);
    connectedUsers.set(userId, socket.id);
  });

  //video calling
  socket.on("call:request", async (data) => {
    try {
      const { callerUserId, callTo, roomId } = data;

      // Fetch user documents from MongoDB using Mongoose
      const callerUser = await UserModel.findById(callerUserId);
      const calleeUser = await UserModel.findById(callTo);

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

  //messages
  socket.on("setup", async (userInfo) => {
    socket.join(userInfo?._id);
    console.log(userInfo?._id, 'user id')
    socket.emit("connected");
    const check = await UserModel.findByIdAndUpdate(userInfo?._id, { status: 'Online' });
    console.log(check)
    // socket.broadcast.emit('user_online', check?.status);

  });

  // socket.on('user_online',(userId)=>{
  //     console.log("get user id for online", userId)
  // })
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("user joined room ", room);
  });

  socket.on("new message", (newMessageRecived) => {
    var chat = newMessageRecived.chat_id;
    // console.log(chat,'check new message chat recived')
    if (!chat.user1 || !chat.user2) return console.log("chat user not defined");
    const senderId = newMessageRecived.sender_id._id;
    if (chat.user1._id === senderId) {
      socket.in(chat.user2._id).emit("message recieved", newMessageRecived);
    } else {
      socket.in(chat.user1._id).emit("message recieved", newMessageRecived);
    }
  });

  // Cleanup when user disconnects
  socket.on("disconnect", () => {
    for (const [userId, socketId] of connectedUsers) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
  });
});
