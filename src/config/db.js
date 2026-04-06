const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'Advera';

let client;
let db;
let mongooseConnectionPromise;

async function connectDB() {
  if (db) return db;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined');
  }

  client = new MongoClient(uri);

  await client.connect();
  db = client.db(dbName);

  if (mongoose.connection.readyState === 0) {
    mongooseConnectionPromise =
      mongooseConnectionPromise ||
      mongoose.connect(uri, {
        dbName,
      });
    await mongooseConnectionPromise;
  }

  console.log('Connected to MongoDB DB:', dbName);
  return db;
}

function getDB() {
  if (!db) {
    throw new Error('Database not connected. Call connectDB first.');
  }
  return db;
}

module.exports = { connectDB, getDB };
