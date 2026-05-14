const express = require('express');
const { createBooking, getMyBookings } = require('../controllers/booking.controller');
const { protect } = require('../middleware/auth.middleware');
const asyncHandler = require('../middleware/asyncHandler.middleware');
const validate = require('../middleware/validate.middleware');
const { createBookingValidator } = require('../validators/booking.validator');

const router = express.Router();

router.post('/', protect, createBookingValidator, validate, asyncHandler(createBooking));
router.get('/my', protect, asyncHandler(getMyBookings));

module.exports = router;
