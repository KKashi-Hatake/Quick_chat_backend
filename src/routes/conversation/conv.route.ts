
import { Router } from "express";
import ConvController from "../../controllers/Conversation.controller";
import { isAuthenticated } from "../../middlewares/isAuthenticated";


export const router = Router();

router.get('/getAll', isAuthenticated, ConvController.getAllConv)




