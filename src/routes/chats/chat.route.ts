
import { Router } from "express";
import { isAuthenticated } from "../../middlewares/isAuthenticated";
import ChatsController from "../../controllers/Chats.controller";


export const router = Router();

// router.get('/search', isAuthenticated, UserController.searchUser)
// router.get('/search-chats-contacts', isAuthenticated, UserController.searchChatsContacts)





router.post('/send', isAuthenticated, ChatsController.sendMsg)
router.get('/getMessages/:id', isAuthenticated, ChatsController.getAllMessages)








