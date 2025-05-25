import multer from "multer";

const storage = multer.memoryStorage();
// Middleware responsible to read form data and upload the File object to the mentioned path
export const uploader = multer({ storage: storage });