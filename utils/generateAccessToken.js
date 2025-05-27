import jwt from 'jsonwebtoken'
import { maxAge } from "./maxage.js";

const createAccessToken = (email,userId)=>{
  const token = jwt.sign({email,userId},process.env.JWT_KEY,{expiresIn:maxAge})
  return token
}

export default createAccessToken