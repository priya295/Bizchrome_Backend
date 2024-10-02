import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  roleType: { type: String, enum: ["freelance", "client"], default: "client" },
  location: { type: String, default: "Rajasthan" },
  image: { type: String },
  Mobile_no: { type: Number },
  bio: { type: String },
  Category: { type: String },
  Subcategory: [{ type: mongoose.Types.ObjectId, ref: "Subcategory" }], // Changed to an array of ObjectIds
  language: { type: String },
  college: { type: String },
  name_of_course: { type: String },
  course_start: { type: Date },
  course_end: { type: Date },
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
      paymentDetails: { paymentId: String, orderId: String, signature: Object },
    },
  ],
  credits: { type: Number, default: 1 },
  status: { type: String, enum: ['Online', 'Offline'], default: 'Offline' },
  joinedAt: { type: Date, default: new Date() },
  isAdmin: { type: Boolean, default: false },
});

const UserModel = mongoose.model("User", userSchema);
export default UserModel;

