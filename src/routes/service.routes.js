const express = require('express');
const {
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
} = require('../controllers/service.controller');
const { getServiceReviews } = require('../controllers/review.controller');
const asyncHandler = require('../middleware/asyncHandler.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router.get('/', asyncHandler(getServices));
router.get('/search', asyncHandler(searchServices));
router.post('/', upload.array('images', 5), asyncHandler(createService));
router.put('/:id', upload.array('images', 5), asyncHandler(updateService));
router.delete('/:id', asyncHandler(deleteService));
router.get('/popular', asyncHandler(getPopularServices));
router.get('/featured', asyncHandler(getFeaturedServices));
router.get('/recommended', asyncHandler(getRecommendedServices));
router.get('/recently-viewed', asyncHandler(getRecentlyViewed));
router.get('/:id/availability', asyncHandler(checkAvailability));
router.get('/:id/reviews', asyncHandler(getServiceReviews));
router.get('/:id', asyncHandler(getServiceById));

module.exports = router;
