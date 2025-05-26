// middleware/error-handler.js
const errorHandlerMiddleware = (err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    msg: err.message || 'Something went wrong'
  })
}

export default errorHandlerMiddleware
