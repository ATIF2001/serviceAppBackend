const { Booking, Service, User } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');

const createBooking = async (req, res) => {
  const { userId, serviceId, bookingDate, bookingTime, address, notes } = req.body;
  if (!userId) return sendError(res, 'userId is required', 400);
  const service = await Service.findByPk(serviceId, { include: [{ model: User, as: 'provider' }] });
  if (!service) return sendError(res, 'Service not found', 404);
  const user = await User.findByPk(userId);
  if (!user) return sendError(res, 'User not found', 404);

  const totalPrice = Number(service.discountedPrice || service.price);
  const booking = await Booking.create({
    userId,
    serviceId: service.id,
    providerId: service.providerId,
    bookingDate,
    bookingTime,
    address,
    notes,
    totalPrice,
    status: 'pending'
  });

  return sendSuccess(res, 'Booking created successfully', booking, 201);
};

const getMyBookings = async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return sendError(res, 'userId is required', 400);
  const bookings = await Booking.findAll({
    where: { userId },
    include: [{ model: Service, as: 'service' }, { model: User, as: 'provider', attributes: ['id', 'name', 'phone', 'profileImage'] }],
    order: [['createdAt', 'DESC']]
  });

  return sendSuccess(res, 'My bookings fetched successfully', bookings);
};

module.exports = { createBooking, getMyBookings };
