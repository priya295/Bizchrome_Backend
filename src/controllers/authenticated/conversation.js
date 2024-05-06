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

        console.log(existingChat ,'check chat')

        if (existingChat) {
             res.status(200).json(existingChat);
        }else{
        // Create a new chat if it doesn't exist
        const newChat = new Chat({ user1: req.userId, user2: userId });
        await newChat.save();
        const fullchat = await Chat.findOne({_id: newChat._id}).populate("user1 user2","-password")

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

            await Chat.findByIdAndUpdate(chatId,{
                latestMessage: message
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