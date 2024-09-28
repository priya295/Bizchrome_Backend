import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  user_image: { type: String },
  bio: { type: String },
  userInfo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },  
  subCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' }] ,
  language: { type: String },
  college: { type: String },
  name_of_course: { type: String },
  course_start: { type: Date },
  course_end: { type: Date },
  experience: { type: String }, // Add appropriate type for experience
});

const serviceModel = mongoose.model("Services", serviceSchema);
export default serviceModel;
