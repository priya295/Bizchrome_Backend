import Chat from "../../models/chat.js";
import Message from "../../models/message.js";
import UserModel from "../../models/user.js";
class conversationController {
    static createChat = async(req, res) =>{
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        // Check if chat already exists
        const existingChat  = await Chat.findOne({
            $or: [
                { user1: req.userId, user2: userId },
                { user1: userId, user2: req.userId }
            ]
        }).populate('user1 user2', '-password').populate('latestMessage')

        if (existingChat) {
            // Check if userId matches with notify.reciver_id and if notify is not already null
            if (existingChat.notify && existingChat.notify.reciver_id && existingChat.notify.reciver_id.equals(req.userId)) {
                if (existingChat.notify.message_count !== null && existingChat.notify.reciver_id !== null) {
                    existingChat.notify = {
                        message_count: 0,
                        reciver_id: null
                    };
    
                    await existingChat.save();
                }
            }

            return res.status(200).json(existingChat);
        }
        else{
        // Create a new chat if it doesn't exist
        const newChat = new Chat({ user1: req.userId, user2: userId });
        await newChat.save();
        const fullchat = await Chat.findOne({_id: newChat._id}).populate("user1 user2","-password")

        await UserModel.findOneAndUpdate(
            { _id: req.userId, credits: { $gt: 0 } }, // find user with sufficient credits
            { $inc: { credits: -1 } }, // decrement credits by 1
            { new: true } // return the updated document
          );

        return res.status(201).json(fullchat);
    }
        } catch (error) {
            console.error("Error creating chat:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static fetchChats = async(req, res) =>{
        try {
            const userChats = await Chat.find({
                $or: [
                    {user1: req.userId},
                    {user2: req.userId}
                ]
            }).populate('user1 user2', "-password").populate("latestMessage").sort({updatedAt: -1})
            .then(async (result) =>{
                result = await UserModel.populate(result,{
                    path: "latestMessage.sender_id",
                    select: "name email"
                })

                res.status(200).send(result);
            })
            return res.status(200).json(userChats)
        } catch (error) {
            console.error("Error fetching chats:", error);
            // return next(error); // Pass
        }
    }

    static sendMessage = async(req, res) =>{
        try {
            const {content , chatId} = req.body;
            if(!content, !chatId){
                console.log("send data please!")
                return res.status(400);
            }

            var newMessage = {
                sender_id: req.userId,
                content: content,
                chat_id: chatId
            }

            var message = await Message.create(newMessage);
            message = await message.populate("sender_id", "name email")
            message = await message.populate("chat_id")
            message = await UserModel.populate(message, {
                path: 'chat_id.user1 chat_id.user2',
                select: 'name email'
            })

            const user = await Chat.findById(chatId)
            const receiver_id = user.user1.equals(req.userId) ? user.user2 : user.user1
    
            await Chat.findByIdAndUpdate(chatId,{
                latestMessage: message,
                $inc: { "notify.message_count": 1 }, // Increment message_count by 1
                "notify.reciver_id": receiver_id // Save user ID in receiver_id
            })
            
            return res.status(201).json({ message: "Message sent successfully", data: message });
        } catch (error) {
            console.error("Error sending message:", error);
            // return next(error);
        }
    }

    static fetchAllMessages = async(req, res) =>{
        try {
            if (!req.params.chatId) {
                return res.status(400).json({ message: "Chat ID is required" });
            }
            const messages = await Message.find({chat_id: req.params.chatId})
            .populate("sender_id","name email").populate("chat_id")
            return res.status(200).json(messages)
        } catch (error) {
            console.error("Error sending message:", error);
            // return next(error); 
        }
    }
}

export default conversationController;