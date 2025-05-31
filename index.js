import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import connectDB from './db/connect.js'
import errorHandlerMiddleware from './middlewares/error-handler.js'

import authRoute from './routes/AuthRoute.js'
import contactRoute from './routes/ContactRoute.js'
import messagesRoute from './routes/MessagesRoute.js'

import setupSocket from './socket.js'
dotenv.config();
const port = process.env.PORT || 3001

//middleware
const app = express()

app.use(cors({
  origin:[process.env.ORIGIN],
  methods:["GET","POST","PUT","PATCH","DELETE"],
  credentials:true
}))

app.use(cookieParser());
app.use(express.json());

//route
app.use('/api/auth',authRoute)
app.use('/api/contacts',contactRoute)
app.use('/api/messages',messagesRoute)


//connect Database
const start = async()=>{
  try {
    await connectDB(process.env.DATABASE_URL)
  } catch (error) {
    (error)
  }
}

start()

app.use(errorHandlerMiddleware)

const server = app.listen(port,()=>{
  console.log(`Server is Running ON Port : ${port}`)
})

setupSocket(server)

