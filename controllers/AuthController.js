import { createCustomError } from "../errors/custom-error.js";
import asyncWrapper from "../middlewares/asyncWapper.js";
import User from "../models/UserModel.js";
import createAccessToken from "../utils/generateAccessToken.js";
import { maxAge } from "../utils/maxage.js";

export const signup = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(createCustomError('Email amd Password is Required', 400))
  }
  const user = await User.create({ email, password });
  res.cookie("jwt", createAccessToken(email, user.id), {
    maxAge,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
  })
  return res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      profileSetup: user.profileSetup
    }
  })
})