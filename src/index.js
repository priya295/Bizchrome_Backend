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

const app = express();
//multer config
const upload = multer({})
app.use(upload.any())

app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());

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
app.use('/user/payment',payment)
app.use('/user/package',packageRoutes)

//error handler
app.use(errorHandler);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
