import { Router } from "express";
import auth from "../middlewares/auth.js";
import { getMessages } from "../controllers/MessageController.js";

const messageRoutes = Router();

messageRoutes.post('/get-messages',auth,getMessages)

export default messageRoutes