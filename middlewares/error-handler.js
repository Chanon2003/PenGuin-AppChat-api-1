// middleware/error-handler.js
const errorHandlerMiddleware = (err, req, res, next) => {
  // console.error(err);
  return res.status(err.statusCode || 500).json({
    msg: err.message || 'Something went wrong',
    error: true,
    success: false,
  })
}

export default errorHandlerMiddleware
