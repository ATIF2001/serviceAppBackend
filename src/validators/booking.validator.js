const { body } = require('express-validator');

const createBookingValidator = [
  body('serviceId').isUUID().withMessage('Valid serviceId is required'),
  body('bookingDate').isDate().withMessage('Valid bookingDate is required'),
  body('bookingTime').notEmpty().withMessage('bookingTime is required'),
  body('address').notEmpty().withMessage('address is required')
];

module.exports = { createBookingValidator };
