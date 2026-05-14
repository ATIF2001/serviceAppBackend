const { StatusCodes } = require('http-status-codes');

const sendSuccess = (res, message, data = null, statusCode = StatusCodes.OK) => {
  return res.status(statusCode).json({ success: true, message, data });
};

const sendError = (res, message, statusCode = StatusCodes.BAD_REQUEST) => {
  return res.status(statusCode).json({ success: false, message });
};

module.exports = { sendSuccess, sendError };
