const { sendSuccess } = require('../utils/response');
const { StatusCodes } = require('http-status-codes');
const s3 = require('../config/s3');
const env = require('../config/env');

const { User, Service } = require('../models');

const getMe = async (req, res) => sendSuccess(res, 'User fetched successfully', req.user);

const updateMe = async (req, res) => {
  const { name, phone, address } = req.body;

  if (req.file) {
    const key = `profiles/${Date.now()}-${req.file.originalname}`;
    await s3.upload({ Bucket: env.aws.bucket, Key: key, Body: req.file.buffer, ContentType: req.file.mimetype }).promise();
    req.user.profileImage = `https://${env.aws.bucket}.s3.${env.aws.region}.amazonaws.com/${key}`;
  }

  req.user.name = name || req.user.name;
  req.user.phone = phone || req.user.phone;
  req.user.address = address || req.user.address;

  await req.user.save();
  return sendSuccess(res, 'Profile updated successfully', req.user, StatusCodes.OK);
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
