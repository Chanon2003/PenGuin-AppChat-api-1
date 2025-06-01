import { Router } from "express";
import auth from "../middlewares/auth.js";
import { getMessages, uploadFile } from "../controllers/MessageController.js";
import { upload } from "../middlewares/multer.js";

const messageRoutes = Router();

messageRoutes.post('/get-messages',auth,getMessages)
messageRoutes.post('/upload-file',auth,upload.single('file'),uploadFile)

export default messageRoutes