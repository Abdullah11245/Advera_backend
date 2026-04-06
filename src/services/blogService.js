const { getDB } = require('../config/db');

const COLLECTION = process.env.BLOG_COLLECTION || 'blogs';

async function createBlog(payload) {
  const db = getDB();
  const result = await db.collection(COLLECTION).insertOne(payload);
  return { _id: result.insertedId, ...payload };
}

async function getAllBlogs() {
  const db = getDB();
  return db.collection(COLLECTION).find().sort({ datePosted: -1 }).toArray();
}

async function getBlogById(id, ObjectId) {
  const db = getDB();
  return db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
}

async function updateBlogById(id, updateObj, ObjectId) {
  const db = getDB();
  return db.collection(COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateObj },
    { returnDocument: 'after', includeResultMetadata: false }
  );
}

async function deleteBlogById(id, ObjectId) {
  const db = getDB();
  return db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
}

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlogById,
  deleteBlogById,
};
