import { Router } from "express";
import { login, refreshToken, signup, updateProfile, userInfo, userLogout } from "../controllers/AuthController.js";
import auth from "../middlewares/auth.js";

const authRoutes = Router();

authRoutes.post('/signup',signup)
authRoutes.post('/login',login)
authRoutes.get('/logout',auth,userLogout)
authRoutes.post('/refresh-token',refreshToken)
authRoutes.get('/user-info',auth,userInfo)
authRoutes.post('/update-profile',auth,updateProfile)

export default authRoutes