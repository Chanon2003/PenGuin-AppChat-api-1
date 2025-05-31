import { createCustomError } from "../errors/custom-error.js";
import asyncWrapper from "../middlewares/asyncWapper.js";
import Message from "../models/MessageModel.js";

export const getMessages = asyncWrapper(async (req, res, next) => {
  
  console.log('come getmessage')
  console.log('req.user',req.user,'req.body',req.body)
  const user1 = req.user.userId;
  const user2 = req.body.id;
  console.log('user1+2',user1,user2)

  if (!user1 || !user2) {
    return next(createCustomError("Both user ID's are required", 400));
  }

  const messages = await Message.find({
    $or:[
      {sender:user1,recipient:user2},
      {sender:user2,recipient:user1},
    ]
  }).sort({timestamp:1});

  return res.status(200).json({messages});
})
 