import { genSalt, hash } from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email:{
    type:String,
    unique:true,
    required:[true,"Email is Required"],
  },
  password:{
    type:String,
    required:[true,"Password is Required"]
  },
  firstName:{
    type:String,
    required:false
  },
  lastName:{
    type:String,
    required:false,
  },
  image:{
    type:String,
    required:false,
  },
  color:{
    type:Number,
    required:false
  },
  profileSetup:{
    type:Boolean,
    default:false
  },
  accessToken:{
    type:String,
    required:false,
  },
  refreshToken:{
    type:String,
    required:false,
  },
});

userSchema.pre("save",async function (next) {
  const salt = await genSalt();
  this.password = hash(this.password,salt);
  next();
});

const User = mongoose.model("Users",userSchema);

export default User;