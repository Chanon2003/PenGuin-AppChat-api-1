import { createCustomError } from "../errors/custom-error.js";
import asyncWrapper from "../middlewares/asyncWapper.js";
import User from "../models/UserModel.js";
import createAccessToken from "../utils/generateAccessToken.js";
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
    return next(createCustomError("Email is not exist", 409));
  }

  const comparePassword = await bcrypt.compare(password,user.password);
  if(!comparePassword){
    return next(createCustomError("Password is not correct",400))
  }

  // const user = await User.create({ email, password: hashedPassword });

  res.cookie("jwt", createAccessToken(email, user.id), {
    maxAge: maxAge,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
  });

  return res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      profileSetup: user.profileSetup,
      firstName:user.firstName,
      lastName:user.lastName,
      image:user.image,
      color:user.color,
    },
  });
});