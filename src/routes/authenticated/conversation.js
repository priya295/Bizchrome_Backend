import express from 'express'
import conversationController from '../../controllers/authenticated/conversation.js';
const router = express.Router();

router.post("/",conversationController.createChat)
router.get("/fetch-chats",conversationController.fetchChats)
router.post("/new-message",conversationController.sendMessage)
router.get("/fetch-message/:chatId",conversationController.fetchAllMessages)
export default router