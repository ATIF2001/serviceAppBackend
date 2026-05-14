const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const env = require('../config/env');
const { User } = require('../models');
const { sendError } = require('../utils/response');

const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return sendError(res, 'Unauthorized', StatusCodes.UNAUTHORIZED);
    }

    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return sendError(res, 'User not found', StatusCodes.UNAUTHORIZED);
    }

    req.user = user;
    return next();
  } catch (error) {
    return sendError(res, 'Invalid token', StatusCodes.UNAUTHORIZED);
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return next();
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findByPk(decoded.id);
    if (user) req.user = user;
    return next();
  } catch (error) {
    return next();
  }
};

module.exports = { protect, optionalAuth };
