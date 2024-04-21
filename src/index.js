import express from "express";
import "dotenv/config";
import cors from 'cors'
import multer from "multer";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler.js";
import userAuth from './routes/userAuth.js'
import payment from './routes/authenticated/payment.js'
import oAuth from './routes/oAuth.js'
import connectDb from "./config/mongo.js";
import packageRoutes from './routes/authenticated/package.js'
import verifyToken from "./middlewares/authentication.js";
import userInfo from "./routes/authenticated/user.js"
import path from 'path'
import messageModel from "./models/message.js";
// import http from 'http'
// import Server from 'socket-io'

const app = express();
// const server = http.createServer(app)
//multer config
const upload = multer({})
app.use(upload.any())

app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());

//socket-io config
// const io = new Server(server, {
//   cors: {
//     origin: process.env.FRONTEND_URL,
//     methods: ["GET", "POST"],
//     credentials: true,
//   }
// });

// io.on('connection',async(socket)=>{
//   // console.log(JSON.stringify(socket.handshake.query),"sockett query");
//   const user_id = socket.handshake.query("user_id");
//   const socket_id = socket.id;
//   console.log("user connected",socket_id);
//   if(Boolean(user_id)){
//     await UserModel.findByIdAndUpdate(user_id,{socket_id,status:"Online"})
//   }

// //for text and link msgs
//   socket.on('text_message',async(data)=>{
//     console.log("recieved message",data);

//     //data:{to,from,text}
//     //create new conversatn if it doesnt exist
//     //sve to db
//     //emit incoming msg -> to user
//     //emit outgoing message -> from user
//   })

//   socket.on('file_message',(data)=>{
//     console.log("recieved file_message",data);
//     //data:{to,from,text,file}
//     //get the file extension
//     const fileExtension = path.extname(data.file.name)
//   //generate a unique filename
//   const fileName = `${Date.now()}_${Math.floor(Math.random()*10000)}${fileExtension}`
//   //upload file to firebase
//       //create new conversatn if it doesnt exist
//     //sve to db
//     //emit incoming msg -> to user
//     //emit outgoing message -> from user
// })

// socket.on("get_direct_conversation",async(user_id,callback)=>{
//   const existingConversations = await messageModel.find({
//     participants:{$all:{user_id}}
//   }).populate("participants","firstName lastName status email")
//   console.log("ExistingConversations:",ExistingConversations);

//   callback(existingConversations)
// })


//   //socket event listeners
//   socket.on("end",async(data)=>{
//     //find user by _id and set status to offline
//     if(data.user_id){
//     await UserModel.findByIdAndUpdate(user_id,{socket_id,status:"Offline"})
//     }

//     //broadcast
//     console.log("closing connection");
//     socket.disconnect(0)
//   })
// })

//cors config
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

//db connection
connectDb();

//server check
app.get("/", (req, res) => {
  res.send("server is working");
});

app.use('/auth',userAuth)

//hit this route for google authentication
app.use('/google-auth', oAuth);

//payment routes - apply authentication middleware
app.use('/user',verifyToken,userInfo)
app.use('/user/payment',payment)
app.use('/user/package',packageRoutes)

//error handler
app.use(errorHandler);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
