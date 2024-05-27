import mongoose from "mongoose";
const chatSchema = new mongoose.Schema({
    user1: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    user2: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    notify: {
        message_count: { type: Number, default: 0 },
        reciver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
});
const Chat  = mongoose.model("Chat", chatSchema);

export default Chat;