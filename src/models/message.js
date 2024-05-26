import mongoose, { mongo } from "mongoose";


const messageSchema = new mongoose.Schema({
  sender_id: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
  content: {type: String, trim: true},
  type: String,
  chat_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Chat'},
},
{timestamps: true}
);
const Message = mongoose.model("Message", messageSchema);
export default Message;