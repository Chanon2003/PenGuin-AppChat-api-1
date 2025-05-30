import jwt from 'jsonwebtoken';
import asyncWrapper from './asyncWapper.js';
import { createCustomError } from '../errors/custom-error.js';

const auth = asyncWrapper(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    (req.headers?.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null);

  if (!token) {
    return next(createCustomError("Authentication required", 401));
  }

  let decode;
  try {
    decode = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
  } catch (err) {
    return next(createCustomError("Unauthorized: Invalid or expired token", 401));
  }

  if (!decode?.userId) {
    return next(createCustomError("Unauthorized: Invalid token payload", 401));
  }

  req.user = decode;

  next();
});

 
export default auth;