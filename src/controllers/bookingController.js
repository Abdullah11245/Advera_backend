const { ObjectId } = require('mongodb');
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

async function getBookingById(req, res, next) {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid booking id' });
    }
    const booking = await bookingService.getBookingById(id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    next(error);
  }
}

async function updateBookingById(req, res, next) {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid booking id' });
    }
    const { name, email, phone, preferredDate, preferredTime, message } = req.body;

    const updatePayload = {};
    if (name !== undefined) updatePayload.name = name;
    if (email !== undefined) updatePayload.email = email;
    if (phone !== undefined) updatePayload.phone = phone;
    if (preferredDate !== undefined) updatePayload.preferredDate = new Date(preferredDate);
    if (preferredTime !== undefined) updatePayload.preferredTime = preferredTime;
    if (message !== undefined) updatePayload.message = message;

    const updated = await bookingService.updateBookingById(id, updatePayload);
    
    if (!updated) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function deleteBookingById(req, res, next) {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid booking id' });
    }
    const result = await bookingService.deleteBookingById(id);
    
    if (!result) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json({ message: 'Booking deleted successfully', id });
  } catch (error) {
    next(error);
  }
}

module.exports = { createBooking, getAllBookings, getBookingById, updateBookingById, deleteBookingById };
