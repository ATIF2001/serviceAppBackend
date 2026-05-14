const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

module.exports = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 422);
  }

  return next();
};
