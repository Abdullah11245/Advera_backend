const { getDB } = require('../config/db');

const COLLECTION = process.env.BOOKING_COLLECTION || 'bookings';

async function createBooking(payload) {
  const db = getDB();
  const result = await db.collection(COLLECTION).insertOne(payload);
  return { _id: result.insertedId, ...payload };
}

async function getAllBookings() {
  const db = getDB();
  return db.collection(COLLECTION).find().sort({ requestedAt: -1 }).toArray();
}

module.exports = { createBooking, getAllBookings };
