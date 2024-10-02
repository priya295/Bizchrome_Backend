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
import adminuser from "./routes/admin/user.js";
import conversation from "./routes/authenticated/conversation.js";
import { Server } from "socket.io";
import path from "path";
import UserModel from "./models/user.js";
import Chat from "./models/chat.js";
import verifyAdmin from "./middlewares/admin_authentication.js";
import categoryRoutes from "./routes/admin/category.js";
import subcategoryRoutes from "./routes/admin/subcategory.js";
import usersRoutes from "./routes/user/user.js";
import ServicesRoutes from "./routes/user/service.js";

// Multer config
const upload = multer({});
const app = express();
app.use(upload.any());

// Middleware setup
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration
const allowedOrigins = [
  'https://admin.bizchrome.ai',
  'https://bizchrome.ai',
  'https://bizchrome.com',
  'http://localhost:3000',
  'https://dev.bizchrome.ai',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Database connection
connectDb();

// Server check
app.get("/", (req, res) => {
  res.send("Server is working");
});

// Routes setup
app.use("/auth", userAuth);
app.use("/validate-token", verifyToken, async (req, res) => {
  const user = await UserModel.findById(req.userId, "name email roleType location verification status credits image joinedAt");
  return res.status(200).json({ message: "Token verified successfully", user });
});
app.use("/google-auth", oAuth);
app.use("/userInfo", verifyToken, userInfo);
app.use("/user/payment", payment);
app.use("/user/package", packageRoutes);
app.use("/user/chat", verifyToken, conversation);
app.use("/admin", verifyAdmin, adminuser);
app.use("/category", categoryRoutes);
app.use("/subcategory", subcategoryRoutes); // Corrected to lowercase for consistency
app.use("/users", usersRoutes); // Updated to plural for clarity
app.use("/user/service", ServicesRoutes);

// Error handler
app.use(errorHandler);

// Server setup
const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`Express is listening at http://localhost:${port}`);
});

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Map to store socket IDs of connected users
const connectedUsers = new Map();
const userStatus = new Map();

io.of('/').on('connection', (socket) => { // Default namespace
  console.log('New client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

io.on("connection", (socket) => {
  console.log(`Socket Connected: ${socket.id}`);

  socket.on("user:connect", async (userId) => {
    connectedUsers.set(userId, socket.id);
    userStatus.set(userId, 'Online');
    await UserModel.updateOne({ _id: userId }, { status: "Online" });
    io.emit("user_status", { userId, status: 'Online' });
  });

  socket.on("user:leave_app", async (userId) => {
    connectedUsers.set(userId, socket.id);
    userStatus.set(userId, 'Offline');
    await UserModel.updateOne({ _id: userId }, { status: "Offline" });
    io.emit("user_status", { userId, status: 'Offline' });
  });

  // Video call events
  socket.on("call:request", async (data) => {
    const { callerUserId, callTo, roomId } = data;
    const callerUser = await UserModel.findById(callerUserId);
    const calleeUser = await UserModel.findById(callTo);
    const calleeSocketId = connectedUsers.get(callTo);

    if (calleeSocketId) {
      io.to(calleeSocketId).emit("call:incoming", { caller: callerUser, roomId });
    }
  });

  socket.on("call:accept", async (data) => {
    const { acceptedBy, callFrom, roomId } = data;
    const callerSocketId = connectedUsers.get(callFrom);
    io.to(callerSocketId).emit("call:accepted", { acceptedBy, roomId });
  });

  socket.on("call:decline", async (data) => {
    const { declinedBy, callFrom, roomId } = data;
    const callerSocketId = connectedUsers.get(callFrom);
    io.to(callerSocketId).emit("call:declined", { declinedBy, roomId });
  });

  socket.on("call:leave", async (data) => {
    const { leftBy, callWith, roomId } = data;
    const otherUserSocketId = connectedUsers.get(callWith);
    const calleeSocketId = connectedUsers.get(leftBy);
    io.to(otherUserSocketId).to(calleeSocketId).emit("call:left", {
      callWith,
      leftBy,
      roomId,
    });
  });

  // Messages
  socket.on("setup", async (userInfo) => {
    socket.join(userInfo?._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User joined room ", room);
  });

  socket.on("new message", (newMessageRecived) => {
    var chat = newMessageRecived.chat_id;
    if (!chat.user1 || !chat.user2) return console.log("Chat user not defined");
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
        console.log(userId, "User is disconnected");
        connectedUsers.delete(userId);
        userStatus.set(userId, 'Offline');
        io.emit("user_status", { userId, status: 'Offline' });
        break;
      }
    }
  });
});
