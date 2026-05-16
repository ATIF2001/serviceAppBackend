const { body } = require('express-validator');

const createReviewValidator = [
  body('serviceId').isUUID().withMessage('Valid serviceId is required'),
  body('reviewerName').optional().isLength({ min: 2 }).withMessage('reviewerName must be at least 2 chars'),
  body('reviewerImage').optional().isURL().withMessage('reviewerImage must be a valid URL'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ min: 2 }).withMessage('Comment must be at least 2 chars')
];

module.exports = { createReviewValidator };
