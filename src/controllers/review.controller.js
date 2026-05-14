const { Review, Service, Booking, User } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');

const createReview = async (req, res) => {
  const { serviceId, rating, comment } = req.body;

  const booking = await Booking.findOne({ where: { userId: req.user.id, serviceId, status: 'completed' } });
  if (!booking) return sendError(res, 'You can review only after completed booking', 400);

  const review = await Review.create({ userId: req.user.id, serviceId, rating, comment });

  const reviews = await Review.findAll({ where: { serviceId } });
  const totalReviews = reviews.length;
  const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews;

  await Service.update({ rating: avgRating.toFixed(2), totalReviews }, { where: { id: serviceId } });

  return sendSuccess(res, 'Review added successfully', review, 201);
};

const getServiceReviews = async (req, res) => {
  const reviews = await Review.findAll({
    where: { serviceId: req.params.id },
    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'profileImage'] }],
    order: [['createdAt', 'DESC']]
  });

  return sendSuccess(res, 'Reviews fetched successfully', reviews);
};

module.exports = { createReview, getServiceReviews };
