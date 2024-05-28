import mongoose from "mongoose";
const connectDb = async () => {
  // mongoose.set("strictQuery", false);
  // mongoose
  //   .connect(process.env.MONGODB_CONNECTION_STRING, { dbName: "BizChrome" })
  //   .then((res) => {
  //     console.log("db connected successfully");
  //   })
  //   .catch((err) => {
  //     console.log("error connecting db", err);
  //   });

  //db connection for production
mongoose.connect(process.env.MONGODB_CONNECTION_STRING)
    .then(() =>
        console.log(
            "Connected to database",
        )).catch((err) => {
            console.log("error in connecting database", err)
        })
};
export default connectDb;
