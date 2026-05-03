import { Router } from "express";
import { isAuthenticated } from "../../middlewares/isAuthenticated";
import CallController from "../../controllers/Call.controller";

export const router = Router();

router.get("/history", isAuthenticated, CallController.getCallHistory);
