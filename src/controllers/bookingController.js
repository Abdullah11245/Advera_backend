const bookingService = require('../services/bookingService');

async function createBooking(req, res, next) {
  try {
    const { name, email, phone, preferredDate, preferredTime, message } = req.body;

    if (!name || !email || !phone || !preferredDate || !preferredTime) {
      return res.status(400).json({ error: 'name, email, phone, preferredDate, preferredTime are required' });
    }

    const payload = {
      name,
      email,
      phone,
      preferredDate: new Date(preferredDate),
      preferredTime,
      message: message || '',
      requestedAt: new Date(),
    };

    const created = await bookingService.createBooking(payload);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
}

async function getAllBookings(req, res, next) {
  try {
    const bookings = await bookingService.getAllBookings();
    res.json(bookings);
  } catch (error) {
    next(error);
  }
}

module.exports = { createBooking, getAllBookings };
