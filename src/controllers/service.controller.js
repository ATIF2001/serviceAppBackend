const { Op } = require('sequelize');
const { Service, User, Category, Review, RecentlyViewed, Booking } = require('../models');
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

const buildSort = sortBy => {
  if (sortBy === 'price_asc') return [['price', 'ASC']];
  if (sortBy === 'price_desc') return [['price', 'DESC']];
  if (sortBy === 'rating') return [['rating', 'DESC']];
  return [['createdAt', 'DESC']];
};

const buildServiceFilters = req => {
  const where = { isActive: true };
  const keywords = req.query.q || req.query.search;

  if (keywords) {
    const parts = String(keywords).trim().split(/\s+/).filter(Boolean);
    where[Op.and] = parts.map(word => ({
      [Op.or]: [
        { title: { [Op.iLike]: `%${word}%` } },
        { description: { [Op.iLike]: `%${word}%` } }
      ]
    }));
  }

  if (req.query.categoryId) where.categoryId = req.query.categoryId;
  if (req.query.featured) where.isFeatured = req.query.featured === 'true';
  if (req.query.minPrice || req.query.maxPrice) {
    where.price = {};
    if (req.query.minPrice) where.price[Op.gte] = req.query.minPrice;
    if (req.query.maxPrice) where.price[Op.lte] = req.query.maxPrice;
  }

  return where;
};

const getServices = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const where = buildServiceFilters(req);

  const { rows, count } = await Service.findAndCountAll({
    where,
    include: [
      { model: Category, as: 'category', attributes: ['id', 'name', ['icon', 'logo']] },
      { model: User, as: 'provider', attributes: ['id', 'name', 'profileImage', 'phone', 'address'] },
      { model: Review, as: 'reviews', attributes: ['id', 'rating'] }
    ],
    limit,
    offset,
    order: buildSort(req.query.sortBy)
  });
  const items = rows;

  const normalizedItems = items.map(service => ({
    ...service.toJSON(),
    mapData: {
      address: service.location || null,
      latitude: null,
      longitude: null
    },
    provider: service.provider ? service.provider.toJSON() : null,
    reviewsCount: service.reviews.length,
    ratingAverage: service.reviews.length
      ? Number((service.reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0) / service.reviews.length).toFixed(2))
      : 0
  }));

  return sendSuccess(res, 'Services fetched successfully', { items: normalizedItems, pagination: { page, limit, total: count } });
};

const searchServices = async (req, res) => {
  return getServices(req, res);
};

const getServiceById = async (req, res) => {
  const service = await Service.findByPk(req.params.id, {
    include: [
      { model: Category, as: 'category', attributes: ['id', 'name', ['icon', 'logo']] },
      { model: User, as: 'provider', attributes: ['id', 'name', 'profileImage', 'phone', 'address'] },
      { model: Review, as: 'reviews', include: [{ model: User, as: 'user', attributes: ['id', 'name', 'profileImage'] }] }
    ]
  });

  if (!service) return sendError(res, 'Service not found', 404);

  const relatedServices = await Service.findAll({
    where: { categoryId: service.categoryId, id: { [Op.ne]: service.id }, isActive: true },
    limit: 5,
    order: [['rating', 'DESC']]
  });

  if (req.user) await RecentlyViewed.findOrCreate({ where: { userId: req.user.id, serviceId: service.id } });

  const servicePayload = {
    ...service.toJSON(),
    mapData: {
      address: service.location || null,
      latitude: null,
      longitude: null
    },
    provider: service.provider ? service.provider.toJSON() : null,
    reviewsCount: service.reviews.length,
    ratingAverage: service.reviews.length
      ? Number((service.reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0) / service.reviews.length).toFixed(2))
      : 0
  };

  return sendSuccess(res, 'Service details fetched successfully', { service: servicePayload, relatedServices });
};

const getPopularServices = async (req, res) => {
  const services = await Service.findAll({ where: { isActive: true }, order: [['totalReviews', 'DESC'], ['rating', 'DESC']], limit: 10 });
  return sendSuccess(res, 'Popular services fetched successfully', services);
};

const getFeaturedServices = async (req, res) => {
  const services = await Service.findAll({ where: { isFeatured: true, isActive: true }, order: [['createdAt', 'DESC']], limit: 10 });
  return sendSuccess(res, 'Featured services fetched successfully', services);
};

const getRecommendedServices = async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return sendError(res, 'userId is required', 400);
  const recent = await RecentlyViewed.findAll({ where: { userId }, limit: 10 });
  const ids = recent.map(r => r.serviceId);

  const baseServices = ids.length ? await Service.findAll({ where: { id: ids } }) : [];
  const categoryIds = [...new Set(baseServices.map(s => s.categoryId))];

  const services = await Service.findAll({
    where: categoryIds.length ? { categoryId: { [Op.in]: categoryIds }, isActive: true } : { isActive: true },
    order: [['rating', 'DESC']],
    limit: 10
  });

  return sendSuccess(res, 'Recommended services fetched successfully', services);
};

const getRecentlyViewed = async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return sendError(res, 'userId is required', 400);
  const items = await RecentlyViewed.findAll({
    where: { userId },
    include: [{ model: Service }],
    order: [['createdAt', 'DESC']],
    limit: 20
  });
  return sendSuccess(res, 'Recently viewed services fetched successfully', items);
};

const checkAvailability = async (req, res) => {
  const { bookingDate, bookingTime } = req.query;
  const service = await Service.findByPk(req.params.id);
  if (!service || !service.isActive) return sendError(res, 'Service not available', 404);

  const existing = await Booking.count({ where: { serviceId: service.id, bookingDate, bookingTime, status: { [Op.in]: ['pending', 'accepted'] } } });
  const available = existing < 5;

  return sendSuccess(res, 'Availability checked successfully', { available, slotsBooked: existing });
};

const createService = async (req, res) => {
  const toArray = value => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return [];
      if (trimmed.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmed);
          return Array.isArray(parsed) ? parsed : [trimmed];
        } catch (error) {
          return trimmed.split(',').map(v => v.trim()).filter(Boolean);
        }
      }
      return trimmed.split(',').map(v => v.trim()).filter(Boolean);
    }
    if (value == null) return [];
    return [value];
  };

  const payload = { ...req.body, providerId: req.body.providerId || req.user?.id || null };
  payload.tags = toArray(req.body.tags);
  if (payload.isFeatured !== undefined) payload.isFeatured = String(payload.isFeatured) === 'true';
  if (payload.isActive !== undefined) payload.isActive = String(payload.isActive) === 'true';
  if (payload.price !== undefined) payload.price = Number(payload.price);
  if (payload.discountedPrice !== undefined && payload.discountedPrice !== '') payload.discountedPrice = Number(payload.discountedPrice);

  if (req.files?.length) {
    payload.images = await Promise.all(req.files.map(file => uploadBufferToS3(file, 'uploads')));
  }
  const provider = await User.findOne({ where: { id: payload.providerId, role: 'provider' } });
  if (!provider) return sendError(res, 'Provider not found. Use a valid providerId.', 400);

  const categoryIds = req.body.categoryIds
    ? toArray(req.body.categoryIds)
    : req.body.categoryId
      ? [req.body.categoryId]
      : [];

  let categories = [];
  if (categoryIds.length) {
    categories = await Category.findAll({ where: { id: { [Op.in]: categoryIds } } });
    if (categories.length !== categoryIds.length) {
      return sendError(res, 'One or more categoryIds are invalid', 400);
    }
    payload.categoryId = categories[0].id;
  }

  const service = await Service.create(payload);
  if (categories.length) {
    await service.setCategories(categories);
  }

  const fullService = await Service.findByPk(service.id, {
    include: [{ model: Category, as: 'category', attributes: ['id', 'name', ['icon', 'logo']] }]
  });
  return sendSuccess(res, 'Service created successfully', fullService, 201);
};

const updateService = async (req, res) => {
  const service = await Service.findByPk(req.params.id);
  if (!service) return sendError(res, 'Service not found', 404);

  const payload = { ...req.body };
  if (payload.isFeatured !== undefined) payload.isFeatured = String(payload.isFeatured) === 'true' || payload.isFeatured === true;
  if (payload.isActive !== undefined) payload.isActive = String(payload.isActive) === 'true' || payload.isActive === true;
  if (payload.price !== undefined) payload.price = Number(payload.price);
  if (payload.discountedPrice !== undefined && payload.discountedPrice !== '') payload.discountedPrice = Number(payload.discountedPrice);

  if (req.files?.length) {
    payload.images = await Promise.all(req.files.map(file => uploadBufferToS3(file, 'uploads')));
  }

  if (payload.providerId) {
    const provider = await User.findOne({ where: { id: payload.providerId, role: 'provider' } });
    if (!provider) return sendError(res, 'Provider not found. Use a valid providerId.', 400);
  }

  await service.update(payload);

  const fullService = await Service.findByPk(service.id, {
    include: [{ model: Category, as: 'category', attributes: ['id', 'name', ['icon', 'logo']] }]
  });
  return sendSuccess(res, 'Service updated successfully', fullService);
};

const deleteService = async (req, res) => {
  const service = await Service.findByPk(req.params.id);
  if (!service) return sendError(res, 'Service not found', 404);

  service.isActive = false;
  await service.save();

  return sendSuccess(res, 'Service deleted successfully', { id: service.id, isActive: service.isActive });
};

module.exports = {
  createService,
  updateService,
  deleteService,
  getServices,
  searchServices,
  getServiceById,
  getPopularServices,
  getFeaturedServices,
  getRecommendedServices,
  getRecentlyViewed,
  checkAvailability
};
