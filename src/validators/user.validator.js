const { body } = require('express-validator');

const updateProfileValidator = [
  body('name').optional().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').optional().isLength({ min: 8 }).withMessage('Phone should be valid'),
  body('address').optional().isLength({ min: 5 }).withMessage('Address should be valid')
];

module.exports = { updateProfileValidator };
