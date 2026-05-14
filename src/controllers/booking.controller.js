const { Booking, Service, User } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');

const createBooking = async (req, res) => {
  const { serviceId, bookingDate, bookingTime, address, notes } = req.body;
  const service = await Service.findByPk(serviceId, { include: [{ model: User, as: 'provider' }] });
  if (!service) return sendError(res, 'Service not found', 404);

  const totalPrice = Number(service.discountedPrice || service.price);
  const booking = await Booking.create({
    userId: req.user.id,
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
  const bookings = await Booking.findAll({
    where: { userId: req.user.id },
    include: [{ model: Service, as: 'service' }, { model: User, as: 'provider', attributes: ['id', 'name', 'phone', 'profileImage'] }],
    order: [['createdAt', 'DESC']]
  });

  return sendSuccess(res, 'My bookings fetched successfully', bookings);
};

module.exports = { createBooking, getMyBookings };
