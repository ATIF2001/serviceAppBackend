const { Op } = require('sequelize');
const { Category, Service } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');
const { s3, getFileUrl } = require('../config/s3');
const env = require('../config/env');
const slugify = value => value.toLowerCase().trim().replace(/\s+/g, '-');
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

const getCategories = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const where = {};

  if (req.query.search) where.name = { [Op.iLike]: `%${req.query.search}%` };
  if (req.query.isActive !== undefined) where.isActive = req.query.isActive === 'true';

  const { rows, count } = await Category.findAndCountAll({ where, limit, offset, order: [['createdAt', 'DESC']] });
  const items = rows.map(c => ({
    id: c.id,
    name: c.name,
    logo: c.icon
  }));
  return sendSuccess(res, 'Categories fetched successfully', { items, pagination: { page, limit, total: count } });
};

const getCategoryById = async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  return sendSuccess(res, 'Category fetched successfully', {
    id: category.id,
    name: category.name,
    logo: category.icon
  });
};

const createCategory = async (req, res) => {
  const { name, logo, image, slug, isActive } = req.body;
  let logoUrl = logo || null;
  let imageUrl = image || null;

  if (req.files?.logo?.[0]) {
    logoUrl = await uploadBufferToS3(req.files.logo[0], 'categories/logo');
  }
  if (req.files?.image?.[0]) {
    imageUrl = await uploadBufferToS3(req.files.image[0], 'categories/image');
  }

  const category = await Category.create({
    name,
    icon: logoUrl,
    image: imageUrl,
    slug: slug || slugify(name),
    isActive: isActive !== undefined ? Boolean(isActive) : true
  });
  return sendSuccess(res, 'Category created successfully', category, 201);
};

const updateCategory = async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) return sendError(res, 'Category not found', 404);

  const { name, logo, slug, isActive } = req.body;
  let logoUrl = logo || category.icon;

  if (req.files?.logo?.[0]) {
    logoUrl = await uploadBufferToS3(req.files.logo[0], 'categories/logo');
  }

  category.name = name || category.name;
  category.icon = logoUrl;
  category.slug = slug || category.slug;
  if (isActive !== undefined) category.isActive = String(isActive) === 'true' || isActive === true;
  await category.save();

  return sendSuccess(res, 'Category updated successfully', {
    id: category.id,
    name: category.name,
    logo: category.icon
  });
};

const deleteCategory = async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) return sendError(res, 'Category not found', 404);

  category.isActive = false;
  await category.save();

  await Service.update({ isActive: false }, { where: { categoryId: category.id } });

  return sendSuccess(res, 'Category deleted successfully', { id: category.id, isActive: category.isActive });
};

module.exports = { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
