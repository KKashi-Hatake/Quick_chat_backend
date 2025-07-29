
import { Router } from "express";
import UserController from "../../controllers/User.controller";
import { isAuthenticated } from "../../middlewares/isAuthenticated";


export const router = Router();

router.get('/search', isAuthenticated, UserController.searchUser)
router.get('/search-chats-contacts', isAuthenticated, UserController.searchChatsContacts)





router.post('/create-conversation-participant', isAuthenticated, UserController.createConversationParticipant)








