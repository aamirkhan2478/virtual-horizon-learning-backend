const notFound = (req, _res, next) => {
  // Create error object
  const error = new Error(`Not Found - ${req.originalUrl}`);
  
  // Set status code to 404
  next(error);
};

const errorHandler = (err, _req, res, _next) => {
  // Set status code to 500 if status code is not set
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Return error response
  return res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

// Export middlewares
module.exports = {
  notFound,
  errorHandler,
};