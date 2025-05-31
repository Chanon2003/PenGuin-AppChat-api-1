import { Router } from "express";
import auth from "../middlewares/auth.js";
import { searchContacts } from "../controllers/ContactController.js";


const contactRoutes = Router();

contactRoutes.post('/search',auth,searchContacts)

export default contactRoutes