import mongoose from "mongoose";
import { createCustomError } from "../errors/custom-error.js";
import asyncWrapper from "../middlewares/asyncWapper.js";
import User from "../models/UserModel.js";
import Message from "../models/MessageModel.js";

export const searchContacts = asyncWrapper(async (req, res, next) => {
  const { searchTerm } = req.body;

  if (searchTerm === undefined || searchTerm === null) {
    return next(createCustomError("searchTerm is required.", 400));
  }

  const sanitizedSearchTerm = searchTerm.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

  const regex = new RegExp(sanitizedSearchTerm, "i");

  const contacts = await User.find({
    $and: [
      { _id: { $ne: req.user.userId } },
      {
        $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
      },
    ],
  });

  return res.status(200).json({ contacts });
})

export const getContactsForDMList = asyncWrapper(async (req, res, next) => {
  let { userId } = req.user;
  console.log(userId);
  userId = new mongoose.Types.ObjectId(userId);

  const contacts = await Message.aggregate([
    {
      $match: {
        $or: [{ sender: userId }, { recipient: userId }],
      },
    },
    {
      $sort: { timestamp: -1 }, // ❗️ใช้ $sort แทน sort
    },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ["$sender", userId] },
            "$recipient",
            "$sender",
          ],
        },
        lastMessageTime: { $first: "$timestamp" },
        lastMessage: { $first: "$content" }, // เพิ่มถ้าอยากโชว์ข้อความล่าสุด
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "contactInfo",
      },
    },
    {
      $unwind: "$contactInfo",
    },
    {
      $project: {
        _id: 1,
        lastMessageTime: 1,
        lastMessage: 1,
        email: "$contactInfo.email",
        firstName: "$contactInfo.firstName",
        lastName: "$contactInfo.lastName",
        image: "$contactInfo.image",
        color: "$contactInfo.color",
      },
    },
    {
      $sort: { lastMessageTime: -1 },
    },
  ]);

  return res.status(200).json({ contacts });
});

