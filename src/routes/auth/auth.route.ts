
import { Router } from "express";
import AuthController from "../../controllers/Auth.controller";
import { uploader } from "../../middlewares/Multer";
import { uploadFileToS3 } from "../../services/AWS/uplaodToS3";
import { deleteFileFromS3 } from "../../services/AWS/deleteFromS3";


export const router = Router();


router.post('/login', AuthController.login)
router.post('/signup', AuthController.signup)

// File(image/avatar) upload
router.post('/upload', uploader.single('file'), uploadFileToS3)
router.delete('/profile_pic', deleteFileFromS3)





