import mongoose from 'mongoose';
const newsLeterSchema = new mongoose.Schema({
email:{type:String,required:true}
})
const newsLetterModel = mongoose.model("Nletter",newsLeterSchema);
export default newsLetterModel
