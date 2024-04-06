import express from "express";
import "dotenv/config";
import mongoose from "mongoose";
import cors from 'cors'
import multer from "multer";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler.js";
import userAuth from './routes/userAuth.js'
import oAuth from './routes/oAuth.js'

const app = express();
//multer config
const upload = multer({})
app.use(upload.any())

app.use(bodyParser.urlencoded({extended:true}))
app.use(cookieParser());

//cors config
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

//server check
app.get("/", (req, res) => {
  res.send("server is working");
});

app.use('/auth',userAuth)

//hit this route for google authentication
app.use('/google-auth', oAuth);

//error handler
app.use(errorHandler);
//db connection
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING, { dbName: "BizChrome" })
  .then((res) => {
    console.log("db connected successfully");
  })
  .catch((err) => {
    console.log("error connecting db", err);
  });


const port = process.env.PORT || 8000;
app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
