const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`, err.stack);
  
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, message: 'A record with this information already exists.' });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File size too large. Maximum 5MB allowed.' });
  }
  if (err.message && err.message.includes('Only JPEG')) {
    return res.status(400).json({ success: false, message: err.message });
  }
  
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal server error. Please try again.' : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { errorHandler };

