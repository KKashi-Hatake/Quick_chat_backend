
import { Router } from "express";
import UserController from "../../controllers/User.controller";
import { uploader } from "../../middlewares/Multer";
import { uploadFileToS3 } from "../../services/AWS/uplaodToS3";
import { deleteFileFromS3 } from "../../services/AWS/deleteFromS3";
import { isAuthenticated } from "../../middlewares/isAuthenticated";


export const router = Router();

router.get('/search', isAuthenticated, UserController.searchUser)


// router.post('/login', UserController.login)
// router.post('/signup', UserController.signup)


// // File(image/avatar) upload
// router.post('/upload', uploader.single('file'), uploadFileToS3)
// router.delete('/profile_pic', deleteFileFromS3)





