import { Router } from "express";
import { addProfileImage, deleteProfileImage, login, refreshToken, signup, updateProfile, userInfo, userLogout } from "../controllers/AuthController.js";
import auth from "../middlewares/auth.js";
import { upload } from "../middlewares/multer.js";

const authRoutes = Router();

authRoutes.post('/signup',signup);
authRoutes.post('/login',login);
authRoutes.get('/logout',auth,userLogout);
authRoutes.post('/refresh-token',refreshToken);
authRoutes.get('/user-info',auth,userInfo);
authRoutes.post('/update-profile',auth,updateProfile);
authRoutes.post(
  '/add-profile-image',
  auth,
  upload.single('image'),
  addProfileImage
);
authRoutes.delete('/remove-profile-image',auth,deleteProfileImage);

export default authRoutes