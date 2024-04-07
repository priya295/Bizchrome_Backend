import mongoose from "mongoose";
const connectDb = async () => {
  mongoose.set("strictQuery", false);
  mongoose
    .connect(process.env.MONGODB_CONNECTION_STRING, { dbName: "BizChrome" })
    .then((res) => {
      console.log("db connected successfully");
    })
    .catch((err) => {
      console.log("error connecting db", err);
    });
};
export default connectDb;
