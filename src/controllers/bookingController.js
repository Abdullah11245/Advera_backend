const { ObjectId } = require('mongodb');
const bookingService = require('../services/bookingService');
const { sendBookingNotification } = require('../services/emailService');

const ALLOWED_STATUSES = ['pending', 'opened', 'contacted', 'completed'];

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
      status: 'pending',
    };

    const created = await bookingService.createBooking(payload);

    // fire-and-forget email; don't block response on mail errors
    sendBookingNotification(created).catch((err) => {
      console.error('[mail] booking notification failed:', err.message);
    });

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

    // Auto-mark as opened on first view
    if (booking.status === 'pending') {
      const updated = await bookingService.updateBookingById(id, { status: 'opened', openedAt: new Date() });
      return res.json(updated);
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

async function updateBookingStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid booking id' });
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${ALLOWED_STATUSES.join(', ')}` });
    }

    const updatePayload = { status };
    if (status === 'contacted') updatePayload.contactedAt = new Date();
    if (status === 'completed') updatePayload.completedAt = new Date();

    const updated = await bookingService.updateBookingById(id, updatePayload);

    if (!updated) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function trackOpen(req, res, next) {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      res.writeHead(204, { 'Content-Type': 'image/gif' });
      return res.end();
    }

    await bookingService.markOpenedIfPending(id);

    // 1x1 transparent GIF
    const pixel = Buffer.from(
      'R0lGODlhAQABAIABAP///wAAACwAAAAAAQABAAACAkQBADs=',
      'base64'
    );
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    });
    return res.end(pixel);
  } catch (error) {
    // still return pixel to avoid broken image in email clients
    const pixel = Buffer.from('R0lGODlhAQABAIABAP///wAAACwAAAAAAQABAAACAkQBADs=', 'base64');
    res.writeHead(200, { 'Content-Type': 'image/gif', 'Content-Length': pixel.length });
    res.end(pixel);
    next(error);
  }
}

module.exports = { createBooking, getAllBookings, getBookingById, updateBookingById, deleteBookingById, updateBookingStatus, trackOpen };
