import Chat from "../../models/chat.js";
import Message from "../../models/message.js";
import UserModel from "../../models/user.js";

class conversationController {
    static createChat = async (req, res) => {
        try {
            const { userId } = req.body;

            if (!userId) {
                return res.status(400).json({ message: "userId is required" });
            }

            // Check if chat already exists
            const existingChat = await Chat.findOne({
                $or: [
                    { user1: req.userId, user2: userId },
                    { user1: userId, user2: req.userId }
                ]
            }).populate('user1 user2', '-password').populate('latestMessage');

            if (existingChat) {
                // Check if notify.reciver_id matches and if it's not already null
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
            } else {
                // Check if the user has enough credits to create a new chat
                const user = await UserModel.findById(req.userId);
                if (user.credits <= 0) {
                    return res.status(403).json({ message: "Insufficient credits to create a new chat." });
                }

                // Create a new chat if it doesn't exist
                const newChat = new Chat({ user1: req.userId, user2: userId });
                await newChat.save();
                const fullChat = await Chat.findOne({ _id: newChat._id }).populate("user1 user2", "-password");

                // Decrement credits of the user who initiated the chat creation
                await UserModel.findByIdAndUpdate(
                    req.userId, // Find the user who initiated the request
                    { $inc: { credits: -1 } }, // Decrement credits by 1
                    { new: true } // Return the updated document
                );

                return res.status(201).json(fullChat);
            }
        } catch (error) {
            console.error("Error creating chat:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static fetchChats = async (req, res) => {
        try {
            const userChats = await Chat.find({
                $or: [
                    { user1: req.userId },
                    { user2: req.userId }
                ]
            }).populate('user1 user2', "-password").populate("latestMessage").sort({ updatedAt: -1 });

            const result = await UserModel.populate(userChats, {
                path: "latestMessage.sender_id",
                select: "name email"
            });

            res.status(200).send(result);
        } catch (error) {
            console.error("Error fetching chats:", error);
            res.status(500).send("An error occurred while fetching chats.");
        }
    }

    static sendMessage = async (req, res) => {
        try {
            const { content, chatId, type } = req.body;
            if (!content || !chatId) {
                console.log("send data please!");
                return res.status(400).json({ message: "Content and chatId are required." });
            }

            var newMessage = {
                sender_id: req.userId,
                content: content,
                chat_id: chatId,
                type,
            };

            var message = await Message.create(newMessage);
            message = await message.populate("sender_id", "name email");
            message = await message.populate("chat_id");
            message = await UserModel.populate(message, {
                path: 'chat_id.user1 chat_id.user2',
                select: 'name email'
            });

            const chat = await Chat.findById(chatId);
            const receiver_id = chat.user1.equals(req.userId) ? chat.user2 : chat.user1;

            await Chat.findByIdAndUpdate(chatId, {
                latestMessage: message,
                $inc: { "notify.message_count": 1 }, // Increment message_count by 1
                "notify.reciver_id": receiver_id // Save user ID in receiver_id
            });

            return res.status(201).json({ message: "Message sent successfully", data: message });
        } catch (error) {
            console.error("Error sending message:", error);
        }
    }

    static fetchAllMessages = async (req, res) => {
        try {
            if (!req.params.chatId) {
                return res.status(400).json({ message: "Chat ID is required" });
            }
            const messages = await Message.find({ chat_id: req.params.chatId })
                .populate("sender_id", "name email").populate("chat_id");
            return res.status(200).json(messages);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    }
}

export default conversationController;
