import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import connectDB from './db/connect.js'
import errorHandlerMiddleware from './middlewares/error-handler.js'
import authRoutes from './routes/AuthRoutes.js'

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
app.use(express.json())

//route
app.use('/api/auth',authRoutes)

//connect Database
const start = async()=>{
  try {
    await connectDB(process.env.DATABASE_URL)
  } catch (error) {
    console.log(error)
  }
}

start()

app.use(errorHandlerMiddleware)

const server = app.listen(port,()=>{
  console.log(`Server is Running ON Port : ${port}`)
})


