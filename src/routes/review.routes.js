const express = require('express');
const { createReview, getServiceReviews } = require('../controllers/review.controller');
const asyncHandler = require('../middleware/asyncHandler.middleware');
const validate = require('../middleware/validate.middleware');
const { createReviewValidator } = require('../validators/review.validator');

const router = express.Router();

router.post('/', createReviewValidator, validate, asyncHandler(createReview));
router.get('/service/:id', asyncHandler(getServiceReviews));

module.exports = router;
