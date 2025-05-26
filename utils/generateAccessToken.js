import jwt from 'jsonwebtoken'
import { maxAge } from "./maxage.js";

const createAccessToken = (email,userId)=>{
  return jwt.sign({email,userId}),process.env.JWT_KEY,{expiresIn:maxAge}
}

export default createAccessToken