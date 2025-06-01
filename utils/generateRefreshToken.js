import User from "../models/UserModel.js";
import jwt from 'jsonwebtoken'

const generatedRefreshToken = async (userId) => {
  const token = jwt.sign({ id: userId }, process.env.SECRET_KEY_REFRESH_TOKEN, { expiresIn: '7d' })

  const updateRefreshTokenUser = await User.updateOne(
    { _id: userId },            
    { $set: { refresh_token: token } } 
  )

  return token
}

export default generatedRefreshToken