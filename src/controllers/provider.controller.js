const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');
const { s3, getFileUrl } = require('../config/s3');
const env = require('../config/env');

const uploadBufferToS3 = async (file, folder) => {
  const key = `${folder}/${Date.now()}-${file.originalname}`;
  const result = await s3.upload({
    Bucket: env.aws.bucket,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype
  }).promise();
  return getFileUrl(result.Key);
};

const getProviders = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const where = { role: 'provider' };

  if (req.query.search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${req.query.search}%` } },
      { email: { [Op.iLike]: `%${req.query.search}%` } },
      { phone: { [Op.iLike]: `%${req.query.search}%` } }
    ];
  }

  const { rows, count } = await User.findAndCountAll({
    where,
    attributes: { exclude: ['password'] },
    limit,
    offset,
    order: [['createdAt', 'DESC']]
  });

  return sendSuccess(res, 'Providers fetched successfully', { items: rows, pagination: { page, limit, total: count } });
};

const getProviderById = async (req, res) => {
  const provider = await User.findOne({ where: { id: req.params.id, role: 'provider' }, attributes: { exclude: ['password'] } });
  if (!provider) return sendError(res, 'Provider not found', 404);
  return sendSuccess(res, 'Provider fetched successfully', provider);
};

const createProvider = async (req, res) => {
  const { name, email, phone, address } = req.body;
  if (!name || !email) return sendError(res, 'name and email are required', 400);

  const existing = await User.findOne({ where: { email } });
  if (existing) return sendError(res, 'Email already exists', 409);

  const tempPassword = Math.random().toString(36).slice(-10);
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  let profileImage = req.body.profileImage || null;
  if (req.file) {
    profileImage = await uploadBufferToS3(req.file, 'providers/profile');
  }

  const provider = await User.create({
    name,
    email,
    phone: phone || null,
    address: address || null,
    profileImage,
    role: 'provider',
    password: hashedPassword
  });

  const safeProvider = provider.toJSON();
  delete safeProvider.password;
  return sendSuccess(res, 'Provider created successfully', safeProvider, 201);
};

const updateProvider = async (req, res) => {
  const provider = await User.findOne({ where: { id: req.params.id, role: 'provider' } });
  if (!provider) return sendError(res, 'Provider not found', 404);

  const { name, phone, address, email } = req.body;

  if (email && email !== provider.email) {
    const existing = await User.findOne({ where: { email } });
    if (existing) return sendError(res, 'Email already exists', 409);
    provider.email = email;
  }

  if (req.file) {
    provider.profileImage = await uploadBufferToS3(req.file, 'providers/profile');
  }

  provider.name = name || provider.name;
  provider.phone = phone || provider.phone;
  provider.address = address || provider.address;
  await provider.save();

  const safeProvider = provider.toJSON();
  delete safeProvider.password;
  return sendSuccess(res, 'Provider updated successfully', safeProvider);
};

const deleteProvider = async (req, res) => {
  const provider = await User.findOne({ where: { id: req.params.id, role: 'provider' } });
  if (!provider) return sendError(res, 'Provider not found', 404);
  await provider.destroy();
  return sendSuccess(res, 'Provider deleted successfully', { id: req.params.id });
};

module.exports = {
  getProviders,
  getProviderById,
  createProvider,
  updateProvider,
  deleteProvider
};
