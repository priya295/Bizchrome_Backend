import mongoose from "mongoose";
const serviceSchema = new mongoose.Schema({
  userInfo: { type: mongoose.Types.ObjectId, ref: "User" },
  BannerImage: { type: String },
  profileImage: { type: String },
  title: { type: String },
  bio: { type: String },
  // pay: {asPer:{type:String,enum:['hour','project']},amount:Number},
  location: { type: String },
  education: [{ from: String, year: String, course: String }],
  experience: [{ orgName: String, years: Number, role: String }],
  connectionSources: {
    portfolio: String,
    linkedIn: String,
    email: String,
    contact: String,
  },
  joinedAt: { type: Date, default: Date.now() },
  areaOfExpertise: [{ domain: String, specifications: [String],skills:[String] }],
});
const serviceModel = mongoose.model("Service", serviceSchema);
export default serviceModel;
