const express = require('express');
const {
  createService,
  getServices,
  searchServices,
  getServiceById,
  getPopularServices,
  getFeaturedServices,
  getRecommendedServices,
  getRecentlyViewed,
  checkAvailability
} = require('../controllers/service.controller');
const { getServiceReviews } = require('../controllers/review.controller');
const asyncHandler = require('../middleware/asyncHandler.middleware');
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router.get('/', asyncHandler(getServices));
router.get('/search', asyncHandler(searchServices));
router.post('/', upload.array('images', 5), asyncHandler(createService));
router.get('/popular', asyncHandler(getPopularServices));
router.get('/featured', asyncHandler(getFeaturedServices));
router.get('/recommended', protect, asyncHandler(getRecommendedServices));
router.get('/recently-viewed', protect, asyncHandler(getRecentlyViewed));
router.get('/:id/availability', asyncHandler(checkAvailability));
router.get('/:id/reviews', asyncHandler(getServiceReviews));
router.get('/:id', optionalAuth, asyncHandler(getServiceById));

module.exports = router;
