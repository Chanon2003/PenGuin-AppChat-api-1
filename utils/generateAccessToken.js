import jwt from 'jsonwebtoken'
import { maxAge } from "./maxage.js";

const generatedAccessToken = (email,userId)=>{
  const token = jwt.sign({email,userId},process.env.SECRET_KEY_ACCESS_TOKEN,{expiresIn:maxAge})
  return token
}

export default generatedAccessToken