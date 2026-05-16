const { sendSuccess } = require('../utils/response');
const { StatusCodes } = require('http-status-codes');
const { s3, getFileUrl } = require('../config/s3');
const env = require('../config/env');

const { User, Service } = require('../models');

const getMe = async (req, res) => {
  const userId = req.query.userId || req.body.userId;
  if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });
  const user = await User.findByPk(userId, { attributes: { exclude: ['password'] } });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  return sendSuccess(res, 'User fetched successfully', user);
};

const updateMe = async (req, res) => {
  const userId = req.query.userId || req.body.userId;
  if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });
  const user = await User.findByPk(userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const { name, phone, address } = req.body;

  if (req.file) {
    const key = `profiles/${Date.now()}-${req.file.originalname}`;
    const result = await s3.upload({ Bucket: env.aws.bucket, Key: key, Body: req.file.buffer, ContentType: req.file.mimetype }).promise();
    user.profileImage = getFileUrl(result.Key);
  }

  user.name = name || user.name;
  user.phone = phone || user.phone;
  user.address = address || user.address;

  await user.save();
  return sendSuccess(res, 'Profile updated successfully', user, StatusCodes.OK);
};

const getProviderProfile = async (req, res) => {
  const provider = await User.findOne({
    where: { id: req.params.id, role: 'provider' },
    attributes: { exclude: ['password'] },
    include: [{ model: Service, as: 'providedServices' }]
  });

  return sendSuccess(res, 'Provider profile fetched successfully', provider);
};

module.exports = { getMe, updateMe, getProviderProfile };
