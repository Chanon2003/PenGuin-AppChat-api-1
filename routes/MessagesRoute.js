import { Router } from "express";
import auth from "../middlewares/auth.js";
import { deleteMessage, getMessages, uploadFile } from "../controllers/MessageController.js";
import { upload } from "../middlewares/multer.js";

const messageRoutes = Router();

messageRoutes.post('/get-messages',auth,getMessages)
messageRoutes.post('/upload-file',auth,upload.single('file'),uploadFile)

messageRoutes.delete('/delete/messages/:id',auth, deleteMessage);

export default messageRoutes