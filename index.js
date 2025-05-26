import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import connectDB from './db/connect.js'

dotenv.config();

const app = express()
const port = process.env.PORT || 3001

app.use(cors({
  origin:[process.env.ORIGIN],
  methods:["GET","POST","PUT","PATCH","DELETE"],
  credentials:true
}))

const start = async()=>{
  try {
    await connectDB(process.env.DATABASE_URL)
  } catch (error) {
    console.log(error)
  }
}

app.use(cookieParser());
app.use(express.json())

start()



const server = app.listen(port,()=>{
  console.log(`Server is Running ON Port : ${port}`)
})


