const { getDB } = require('../config/db');

const COLLECTION = process.env.PORTFOLIO_COLLECTION || 'portfolios';

async function createPortfolio(payload) {
  const db = getDB();
  const result = await db.collection(COLLECTION).insertOne(payload);
  return { _id: result.insertedId, ...payload };
}

async function getAllPortfolios() {
  const db = getDB();
  return db.collection(COLLECTION).find().sort({ createdAt: -1 }).toArray();
}

async function getPortfolioById(id, ObjectId) {
  const db = getDB();
  return db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
}

async function updatePortfolioById(id, updateObj, ObjectId) {
  const db = getDB();
  return db.collection(COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateObj },
    { returnDocument: 'after', includeResultMetadata: false }
  );
}

async function deletePortfolioById(id, ObjectId) {
  const db = getDB();
  return db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
}

module.exports = {
  createPortfolio,
  getAllPortfolios,
  getPortfolioById,
  updatePortfolioById,
  deletePortfolioById,
};
