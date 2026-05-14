const { Op } = require('sequelize');
const { Category } = require('../models');
const { sendSuccess } = require('../utils/response');
const slugify = value => value.toLowerCase().trim().replace(/\s+/g, '-');

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
    logo: c.icon,
    image: c.image,
    slug: c.slug,
    isActive: c.isActive
  }));
  return sendSuccess(res, 'Categories fetched successfully', { items, pagination: { page, limit, total: count } });
};

const getCategoryById = async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  return sendSuccess(res, 'Category fetched successfully', {
    id: category.id,
    name: category.name,
    logo: category.icon,
    image: category.image,
    slug: category.slug,
    isActive: category.isActive
  });
};

const createCategory = async (req, res) => {
  const { name, logo, image, slug, isActive } = req.body;
  const category = await Category.create({
    name,
    icon: logo || null,
    image: image || null,
    slug: slug || slugify(name),
    isActive: isActive !== undefined ? Boolean(isActive) : true
  });
  return sendSuccess(res, 'Category created successfully', category, 201);
};

module.exports = { getCategories, getCategoryById, createCategory };
