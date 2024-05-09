import mongoose from "mongoose";
const chatSchema = new mongoose.Schema({
    user1: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    user2: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    latestMessage: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Message'
    },
    notify: {
        message_count : {type: Number, default: 0},
        reciver_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
     },
})


chatSchema.pre('save', async function(next) {
    try {
      // Increment the message_count by 1 before saving
      this.message_count += 1;
      next(); // Call next to continue saving the document
    } catch (error) {
      next(error); // Pass any errors to the next middleware or route handler
    }
  });
const Chat  = mongoose.model("Chat", chatSchema);

export default Chat;