import mongoose from "mongoose";
const serviceSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  amount: { type: Number },
  category: { type: String },
  skills: [String],
  tags: [String],
  education: [{ type: String }],
  certifications: [String],
  achievements: [String],
  extraServices: [{ name: String, amount: Number }],
  proofOfWork: [String], // here we can get links nd images for projects
  Faqs: [{ que: String, ans: String }],
  category: {
    type: String,
    enum: [
      "digital marketing",
      "graphics and designs",
      "writing and translations",
      "businesses",
      "prog and tech",
      "music and audio",
      "video animations",
      "data",
      "photography",
      "lifestyle",
      "design and creative",
      "development",
      "finance & account",
      "content writer",
    ],
  },
});
export default serviceSchema;
