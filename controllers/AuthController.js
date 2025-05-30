import { createCustomError } from "../errors/custom-error.js";
import asyncWrapper from "../middlewares/asyncWapper.js";
import User from "../models/UserModel.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary.js";
import generatedAccessToken from "../utils/generateAccessToken.js";
import generatedRefreshToken from "../utils/generateRefreshToken.js";
import { maxAge } from "../utils/maxage.js";

import bcrypt from "bcrypt";

export const signup = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(createCustomError('Email and Password are required', 400));
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(createCustomError("Email already in use", 409));
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hashedPassword });

  return res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      profileSetup: user.profileSetup,
    },
  });
});

export const login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(createCustomError('Email and Password are required', 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(createCustomError("Email is not exist", 404));
  }

  const comparePassword = await bcrypt.compare(password, user.password);

  if (!comparePassword) {
    return next(createCustomError("Password is not correct", 401)); // ✅ ต้องมี return!
  }

  const cookiesOption = {
    maxAge: maxAge,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: 'None',
  };

  const refreshTokenOptions = {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 วัน
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: 'None',
  };

  const accessToken = generatedAccessToken(email, user.id)
  const refreshToken = generatedRefreshToken(user.id)

  res.cookie('accessToken', accessToken, cookiesOption);
  res.cookie('refreshToken', refreshToken, refreshTokenOptions);

  return res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      profileSetup: user.profileSetup,
      firstName: user.firstName,
      lastName: user.lastName,
      image: user.image,
      color: user.color,
    },
  });
});

export const refreshToken = asyncWrapper(async (req, res, next) => {
  const refreshToken =
    req.cookies.refreshToken ||
    (req.headers.authorization && req.headers.authorization.split(" ")[1]);

  if (!refreshToken) {
    return next(createCustomError('Invalid token', 401));
  }

  let verifyToken;
  try {
    verifyToken = jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN);
  } catch (error) {
    return next(createCustomError('Token is expired or invalid', 401));
  }

  const userId = verifyToken.id;
  if (!userId) {
    return next(createCustomError('Invalid token payload', 401));
  }

  const user = await User.findById(userId);

  if (!user) {
    return next(createCustomError('User not found', 404));
  }

  // สมมติ generatedAccessToken ต้องการ (email, id)
  const newAccessToken = generatedAccessToken(user.email, user.id);

  const cookieOptions = {
    maxAge,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
  };

  res.cookie("accessToken", newAccessToken, cookieOptions);

  return res.status(200).json({
    message: "New Access Token generated",
    error: false,
    success: true,
    data: {
      accessToken: newAccessToken,
    },
  });
});

export const userLogout = asyncWrapper(async (req, res, next) => {
  const userId = req.user?.userId;

  if (!userId) {
    return next(createCustomError("Unauthorized: Missing user id", 401));
  }

  const cookiesOption = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'None',
    path: '/', // 🔸 สำคัญ
  };

  // 🔸 ล้าง cookie ฝั่ง client
  res.clearCookie('accessToken', cookiesOption);
  res.clearCookie('refreshToken', cookiesOption);

  // 🔸 ล้าง refresh_token ใน database (ถ้ามีการเก็บไว้)
  const removeRefreshToken = await User.updateOne(
    { _id: userId },
    { $set: { refresh_token: "" } }
  );

  if (removeRefreshToken.modifiedCount === 0) {
    console.warn("No refresh_token was cleared. Already empty?");
  }

  return res.json({
    message: "Logout successfully",
    error: false,
    success: true,
  });
});

export const userInfo = asyncWrapper(async (req, res, next) => {
  const id = req.user.userId
  const userData = await User.findById(id)

  return res.status(200).json({
    id: userData.id,
    email: userData.email,
    profileSetup: userData.profileSetup,
    firstName: userData.firstName,
    lastName: userData.lastName,
    image: userData.image,
    color: userData.color,
  })
});

export const updateProfile = asyncWrapper(async (req, res, next) => {
  const id = req.user.userId;
  const { firstName, lastName, color } = req.body;
  if (!firstName || !lastName || color === undefined) {
    return next(createCustomError("Firsname lastname and color is required", 400));
  }

  const userData = await User.findByIdAndUpdate(id, {
    firstName, lastName, color, profileSetup: true
  }, { new: true, runValidators: true })

  return res.status(200).json({
    id: userData.id,
    email: userData.email,
    profileSetup: userData.profileSetup,
    firstName: userData.firstName,
    lastName: userData.lastName,
    image: userData.image,
    color: userData.color,
  })
});

export const addProfileImage = asyncWrapper(async (req, res, next) => {
  if (!req.file) {
    return next(createCustomError('Image file is required', 400));
  }

  const folderType = req.body.folderType || 'profile';

  const result = await uploadToCloudinary(req.file.buffer, folderType);
  
  const updatedUser = await User.findByIdAndUpdate(
    req.user.userId,
    {
      image: result.secure_url,
      imagePublicId: result.public_id,
    },
    { new: true, runValidators: true }
  );

  return res.status(200).json({
    message: 'Image uploaded successfully',
    image: updatedUser.image,
  });
});

export const deleteProfileImage = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.user.userId);
  if (!user || !user.imagePublicId) {
    return next(createCustomError('No image to delete', 404));
  }

  await deleteFromCloudinary(user.imagePublicId);

  user.image = '';
  user.imagePublicId = '';
  await user.save();

  res.status(200).json({ message: 'Image deleted successfully' });
});




