const bcrypt = require('bcryptjs');
const { StatusCodes } = require('http-status-codes');
const { User } = require('../models');
const { generateToken } = require('../utils/jwt');
const { sendSuccess } = require('../utils/response');

const signup = async (req, res) => {
  const { name, email, phone, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({ name, email, phone, password: hashedPassword, role: role || 'user' });
  const token = generateToken({ id: user.id, role: user.role });

  return sendSuccess(res, 'Signup successful', { token, user }, StatusCodes.CREATED);
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user) return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Invalid credentials' });

  const matched = await bcrypt.compare(password, user.password);
  if (!matched) return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Invalid credentials' });

  const token = generateToken({ id: user.id, role: user.role });
  return sendSuccess(res, 'Login successful', { token, user });
};

module.exports = { signup, login };
