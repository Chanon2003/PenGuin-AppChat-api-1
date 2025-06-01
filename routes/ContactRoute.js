import { Router } from "express";
import auth from "../middlewares/auth.js";
import { getAllContacts, getContactsForDMList, searchContacts } from "../controllers/ContactController.js";

const contactRoutes = Router();

contactRoutes.post('/search',auth,searchContacts)
contactRoutes.get('/get-contacts-for-dm',auth,getContactsForDMList)
contactRoutes.get('/get-all-contacts',auth,getAllContacts)

export default contactRoutes