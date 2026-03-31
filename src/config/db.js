const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://abdullah543711326_db_user:Hb0tmayjwgUib2y5@adveracluser.wbvwckm.mongodb.net/?appName=AdveraCluser" ;
const dbName = "Advera";

let client;
let db;

async function connectDB() {
  if (db) return db;

  client = new MongoClient(uri); // ✅ removed old options

  await client.connect();
  db = client.db(dbName);

  console.log('Connected to MongoDB:', uri, 'DB:', dbName);
  return db;
}

function getDB() {
  if (!db) {
    throw new Error('Database not connected. Call connectDB first.');
  }
  return db;
}

module.exports = { connectDB, getDB };