import { Server as SocketIOServer } from 'socket.io';
import Message from './models/MessageModel.js';
import Channel from './models/ChannelModel.js';

const setupSocket = (server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const userSocketMap = new Map();

  const sendChannelMessage = async (message) => {
    const { channelId, sender, content, messageType, fileUrl } = message;

    const createdMessage = await Message.create({
      sender,
      recipient: null,
      content: messageType === 'text' ? content : '',
      messageType,
      timestamp: new Date(),
      fileUrl,
    });

    const messageData = await Message.findById(createdMessage._id)
      .populate("sender", "id email firstName lastName image color")
      .exec();

    await Channel.findByIdAndUpdate(
      channelId,
      { $push: { messages: createdMessage._id } },
      { new: true }
    );

    const channel = await Channel.findById(channelId)
      .populate("members")
      .populate("admin");

    const finalData = { ...messageData._doc, channelId: channel._id };

    if (channel && channel.members && channel.admin) {
      // รวมสมาชิกและ admin แล้วแปลงเป็น array ของ id string
      const allRecipientsIds = [
        ...channel.members.map(m => m._id.toString()),
        ...channel.admin.map(a => a._id.toString())
      ];

      // เอาเฉพาะ id ไม่ซ้ำ
      const uniqueRecipientIds = [...new Set(allRecipientsIds)];

      // ส่งข้อความให้ socket แต่ละคนแค่ครั้งเดียว
      uniqueRecipientIds.forEach((userId) => {
        const socketId = userSocketMap.get(userId);
        if (socketId) {
          io.to(socketId).emit("receive-channel-message", finalData);
        }
      });
    }
  };

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`User connected: ${userId} with Socket Id: ${socket.id}`);
    } else {
      console.log("User ID not provided during connection");
    }

    socket.on('sendMessage', async (message) => {
      try {
        const senderSocketId = userSocketMap.get(message.sender);
        const recipientSocketId = userSocketMap.get(message.recipient);

        const createdMessage = await Message.create(message);

        const messageData = await Message.findById(createdMessage._id)
          .populate('sender', "id email firstName lastName image color")
          .populate('recipient', "id email firstName lastName image color");

        if (recipientSocketId) {
          io.to(recipientSocketId).emit('receiveMessage', messageData);
        }

        if (senderSocketId) {
          io.to(senderSocketId).emit('receiveMessage', messageData);
        }
      } catch (error) {
        console.error("sendMessage error:", error);
      }
    });

    socket.on('send-channel-message', sendChannelMessage)

    socket.on("disconnect", () => {
      console.log(`Client Disconnected ${socket.id}`);
      for (const [id, sockId] of userSocketMap.entries()) {
        if (sockId === socket.id) {
          userSocketMap.delete(id);
          break;
        }
      }
    });
  });
};

export default setupSocket;
