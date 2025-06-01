import { createCustomError } from "../errors/custom-error.js";
import asyncWrapper from "../middlewares/asyncWapper.js";
import Message from "../models/MessageModel.js";
import { uploadToCloudinary, uploadToCloudinaryRaw } from "../utils/cloudinary.js";
import path from 'path';

export const getMessages = asyncWrapper(async (req, res, next) => {
  const user1 = req.user.userId;
  const user2 = req.body.id;

  if (!user1 || !user2) {
    return next(createCustomError("Both user ID's are required", 400));
  }

  const messages = await Message.find({
    $or: [
      { sender: user1, recipient: user2 },
      { sender: user2, recipient: user1 },
    ]
  }).sort({ timestamp: 1 });

  return res.status(200).json({ messages });
})

export const uploadFile = asyncWrapper(async (req, res, next) => {
  if (!req.file) {
    return next(createCustomError("File is required", 400));
  }

  const folderType = req.body.folderType || 'chat';

  // ดึงชื่อไฟล์และนามสกุล
  const ext = path.extname(req.file.originalname); // เช่น .pdf
  const fileName = path.basename(req.file.originalname, ext);
  const publicId = `${fileName}-${Date.now()}${ext}`;

  let result;

  if (req.file.mimetype.startsWith('image')) {
    result = await uploadToCloudinary(req.file.buffer, folderType); // รูปภาพใช้ auto ตามเดิม
  } else if (
    req.file.mimetype === 'application/zip' ||
    req.file.mimetype === 'application/x-zip-compressed' ||
    req.file.mimetype === 'application/pdf' ||
    req.file.mimetype === 'text/plain'
  ) {
    // อัปโหลดเป็น resource_type raw + กำหนดชื่อไฟล์ (มี .ext)
    result = await uploadToCloudinaryRaw(req.file.buffer, folderType, publicId);
  } else {
    result = await uploadToCloudinary(req.file.buffer, folderType);
  }

  return res.status(200).json({
    filePath: result.secure_url,
    filePublicId: result.public_id,
  });
});

export const getSignedDownloadUrl = asyncWrapper(async (req, res, next) => {
  const { publicId, resourceType = 'raw' } = req.query;

  if (!publicId) {
    return next(createCustomError('Missing publicId', 400));
  }

  // สร้าง signed URL หมดอายุ 10 นาที
  const signedUrl = cloudinary.url(publicId, {
    resource_type: resourceType,
    sign_url: true,
    expires_at: Math.floor(Date.now() / 1000) + 60 * 10, // 10 นาทีจากนี้
  });

  return res.status(200).json({ url: signedUrl });
});

export const deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.id;

    const deleted = await Message.findByIdAndDelete(messageId);
    if (!deleted) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting message', error });
  }
};
