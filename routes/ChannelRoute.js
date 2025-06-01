import { Router } from "express";
import auth from "../middlewares/auth.js";
import { createChannel, getChannelMessages, getUserChannels } from "../controllers/ChannelController.js";

const channelRoute = Router();

channelRoute.post('/create-channel',auth,createChannel)
channelRoute.get('/get-user-channels',auth,getUserChannels)
channelRoute.get('/get-channels-message/:channelId',auth,getChannelMessages)


export default channelRoute