import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  roleType:{type:String,enum:["freelance","client"]},
  location:String,
  google_sub: { type: String },
  google_auth: { type: Boolean, default: false },
  manual_register: { type: Boolean, default: false },
  password: { type: String },
  verification: {
    code: Number,
    expiresAt: Date,
    isVerified: { type: Boolean, default: false },
  },
  packages: [
    {
      packageId: { type: mongoose.Types.ObjectId, ref: "Package" },
      date: { type: Date },
      paymentDetails: { paymentId: String, orderId: String, signature: String },
    },
  ],
  credits:{type:Number,default:10},
  status:{type:String,enum:['Online','Offline'], default: 'Offline'}
});
const UserModel = mongoose.model("User", userSchema);
export default UserModel;
