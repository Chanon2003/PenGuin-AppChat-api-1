import { Router } from "express";
import auth from "../middlewares/auth.js";
import { getContactsForDMList, searchContacts } from "../controllers/ContactController.js";

const contactRoutes = Router();

contactRoutes.post('/search',auth,searchContacts)
contactRoutes.get('/get-contacts-for-dm',auth,getContactsForDMList)

export default contactRoutes