const { StatusCodes } = require('http-status-codes');
const { sendError } = require('../utils/response');

module.exports = (error, req, res, next) => {
  if (error.name === 'SequelizeUniqueConstraintError') {
    return sendError(res, 'Resource already exists', StatusCodes.CONFLICT);
  }

  if (error.name === 'SequelizeValidationError') {
    return sendError(res, error.errors[0].message, StatusCodes.BAD_REQUEST);
  }

  return sendError(res, error.message || 'Internal server error', error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR);
};
