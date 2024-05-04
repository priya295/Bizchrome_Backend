import mongoose, { mongo } from "mongoose";

// const oneToOneMessageSchema = new mongoose.Schema({
//   participants: [
//     {
//       type: mongoose.Schema.ObjectId,
//       ref: "User",
//     },
//   ],
//   messages: [
//     {
//       to: {
//         type: mongoose.Schema.ObjectId,
//         ref: "User",
//       },
//       from: {
//         type: mongoose.Schema.ObjectId,
//         ref: "User",
//       },
//       type: {
//         type: String,
//         enum: ["Text", "Media", "Document", "Link"],
//       },
//       created_at: {
//         type: Date,
//         default: Date.now(),
//       },
//       text: {
//         type: String,
//       },
//       file: {
//         type: String,
//       },
//     },
//   ],
// });

// const messageModel = new mongoose.model(
//   "OneToOneMessage",
//   oneToOneMessageSchema
// );
// export default messageModel

const messageSchema = new mongoose.Schema({
  sender_id: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
  content: {type: String, trim: true},
  chat_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Chat'},
},
{timestamps: true}
);

const Message = mongoose.model("Message", messageSchema);
export default Message;