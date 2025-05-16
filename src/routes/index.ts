import { Router } from "express";
import AuthController from "../controllers/Auth.controller";
import ChatGroupController from "../controllers/ChatGroup.controller";
import  authMiddleware  from "../middlewares/AuthMiddleware";
import ChatGroupUserController from "../controllers/ChatGroupUser.controller";
import ChatsController from "../controllers/Chats.controller";

const router = Router();

// Auth Routes
router.post('/auth/login', AuthController.login)

//Chat group routes
router.get('/chat-group', authMiddleware, ChatGroupController.index)
router.get('/chat-group/:id', ChatGroupController.show)
router.post('/chat-group', authMiddleware, ChatGroupController.store)
router.put('/chat-group/:id', authMiddleware, ChatGroupController.update)
router.delete('/chat-group/:id', authMiddleware, ChatGroupController.destroy)



// Chat grou users
router.get('/chat-group-users', ChatGroupUserController.index)
router.post('/chat-group-users', ChatGroupUserController.store)



// Chat Messages
router.get('/chat-messages/:groupId', ChatsController.index)







export default router;