import mongoose from "mongoose";
import { createCustomError } from "../errors/custom-error.js";
import asyncWrapper from "../middlewares/asyncWapper.js";
import Channel from "../models/ChannelModel.js";
import User from "../models/UserModel.js";

export const createChannel = asyncWrapper(async (req, res, next) => {
  const {name,members} = req.body;

  const userId = req.user.userId;

  const admin = await User.findById(userId);

  if(!admin){
    return next(createCustomError("Admin user not found.", 400));
  }

  const validMember = await User.find({_id:{$in:members}});

  if(validMember.length !== members.length){
    return next(createCustomError("Some member are not valid users.", 400));
  }
  
  const newChannel = new Channel({
    name,
    members,
    admin:userId
  })

  await newChannel.save()

  return res.status(201).json({ channel : newChannel });
})

export const getUserChannels = asyncWrapper(async (req, res, next) => {
  const userId = new mongoose.Types.ObjectId(req.user.userId);
  const channels = await Channel.find({
    $or:[{admin:userId},{members:userId}],
  }).sort({updatedAt:-1});

  const admin = await User.findById(userId);

  return res.status(201).json({ channels });
})

export const getChannelMessages= asyncWrapper(async (req, res, next) => {
  const {channelId} = req.params;

  const channel = await Channel.findById(channelId).populate({
    path:'messages',
    populate:{
      path:'sender',
      select:'firstName lastName email _id image color',
    },
  })
  if(!channel){
    return next(createCustomError("Channel not found.",404))
  }
  const messages = channel.messages;
  return res.status(201).json({ messages });
})