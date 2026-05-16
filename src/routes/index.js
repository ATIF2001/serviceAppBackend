const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const categoryRoutes = require('./category.routes');
const serviceRoutes = require('./service.routes');
const bookingRoutes = require('./booking.routes');
const reviewRoutes = require('./review.routes');
const providerRoutes = require('./provider.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/services', serviceRoutes);
router.use('/bookings', bookingRoutes);
router.use('/reviews', reviewRoutes);
router.use('/providers', providerRoutes);

module.exports = router;
