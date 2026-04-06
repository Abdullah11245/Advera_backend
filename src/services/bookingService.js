const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

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

async function getBookingById(id) {
  const db = getDB();
  return db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
}

async function updateBookingById(id, updatePayload) {
  const db = getDB();
  const result = await db.collection(COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updatePayload },
    { returnDocument: 'after' }
  );
  return result.value;
}

async function deleteBookingById(id) {
  const db = getDB();
  const result = await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

module.exports = { createBooking, getAllBookings, getBookingById, updateBookingById, deleteBookingById };
