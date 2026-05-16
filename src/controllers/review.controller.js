const { Review, Service, User } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');

const createReview = async (req, res) => {
  const { serviceId, rating, comment, reviewerName, reviewerImage, userId } = req.body;
  const service = await Service.findByPk(serviceId);
  if (!service) return sendError(res, 'Service not found', 404);

  const review = await Review.create({
    userId: userId || null,
    serviceId,
    reviewerName: reviewerName || null,
    reviewerImage: reviewerImage || null,
    rating,
    comment
  });

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

  const mapped = reviews.map(review => {
    const plain = review.toJSON();
    return {
      id: plain.id,
      serviceId: plain.serviceId,
      reviewerName: plain.reviewerName || plain.user?.name || null,
      reviewerImage: plain.reviewerImage || plain.user?.profileImage || null,
      rating: plain.rating,
      comment: plain.comment,
      createdAt: plain.createdAt
    };
  });

  return sendSuccess(res, 'Reviews fetched successfully', mapped);
};

module.exports = { createReview, getServiceReviews };
