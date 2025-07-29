import { Router } from "express";
import {router as AuthRouter} from './auth/auth.route';
import {router as UserRouter} from './user/user.route';
import {router as ConvRouter} from './conversation/conv.route';
import {router as ChatRouter} from './chats/chat.route';

const router = Router();

// Auth Routes
router.use('/auth', AuthRouter)

//User
router.use('/user', UserRouter)


//conversations
router.use('/conv', ConvRouter)


// chat routes
router.use('/chat', ChatRouter)






export default router;