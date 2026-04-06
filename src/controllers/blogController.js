const { ObjectId } = require('mongodb');
const { getCloudinary } = require('../config/cloudinary');
const blogService = require('../services/blogService');
const multer = require('multer');

// Configure multer memory storage (files stay in memory for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware to handle single image upload
const uploadSingleImage = upload.single('image');

// Normalize blog sections
function normalizeSections(sections) {
  if (!Array.isArray(sections)) return [];
  return sections.map((item) => ({
    heading: item.heading || '',
    paragraph: item.paragraph || '',
  }));
}

async function uploadToCloudinary(fileBuffer) {
  return new Promise((resolve, reject) => {
    const cloudinary = getCloudinary();
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'blogs' },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result.secure_url);
      }
    );

    uploadStream.end(fileBuffer);
  });
}

function normalizeTags(tags) {
  if (!tags) return [];

  try {
    const parsed = typeof tags === 'string' ? JSON.parse(tags) : tags;
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => item && item.trim());
    }

    return typeof parsed === 'string' && parsed.trim() ? [parsed] : [];
  } catch (error) {
    return typeof tags === 'string' && tags.trim() ? [tags] : [];
  }
}

// Upload file buffer to Cloudinary
// Dedicated route for uploading image only
async function uploadImage(req, res, next) {
  try {
    // Step 1: Check if a file was uploaded
    if (!req.file) return res.status(400).json({ error: 'No image file uploaded' });

    // Step 2: Get Cloudinary instance
    const cloudinary = getCloudinary();

    // Step 3: Create an upload stream and upload the file buffer
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'blogs' }, // Folder in Cloudinary
      (error, result) => {
        if (error) return next(error); // Pass any Cloudinary errors to Express

        // Step 4: Return the uploaded image URL
        res.json({
          imageUrl: result.secure_url,
          publicId: result.public_id
        });
      }
    );

    // Step 5: Pipe the file buffer to Cloudinary
    uploadStream.end(req.file.buffer);
  } catch (error) {
    next(error); // Catch any unexpected errors
  }
}

// Create new blog
async function createBlog(req, res, next) {
  try {
    const { title, author, datePosted, readTime, subheading, paragraph } = req.body;
    const tags = normalizeTags(req.body.tags);
    let sections = [];

    if (req.body.sections) {
      try {
        sections = typeof req.body.sections === 'string'
          ? JSON.parse(req.body.sections)
          : req.body.sections;
      } catch (err) {
        sections = [];
      }
    }

    if (!title || !author || !datePosted || !readTime || !subheading || !paragraph) {
      return res.status(400).json({ error: 'title, author, datePosted, readTime, subheading, paragraph are required' });
    }

    const normalizedTags = tags;
    const normalizedSections = normalizeSections(sections);

    let imageUrl = req.body.imageUrl || '';

if (req.file && !imageUrl) {
 
  imageUrl = await uploadToCloudinary(req.file.buffer);
}

    const payload = {
      title,
      author,
      datePosted: new Date(datePosted),
      readTime,
      tags: normalizedTags,
      subheading,
      paragraph,
      sections: normalizedSections,
      imageUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const created = await blogService.createBlog(payload);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
}

// Update blog by ID
async function updateBlogById(req, res, next) {

  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid blog id' });

    const { title, author, datePosted, readTime, subheading, paragraph } = req.body;

    const updateObj = { updatedAt: new Date() };
    if (title) updateObj.title = title;
    if (author) updateObj.author = author;
    if (datePosted) updateObj.datePosted = new Date(datePosted);
    if (readTime) updateObj.readTime = readTime;
    if (typeof req.body.tags !== 'undefined') updateObj.tags = normalizeTags(req.body.tags);
    if (subheading) updateObj.subheading = subheading;
    if (paragraph) updateObj.paragraph = paragraph;
    if (typeof req.body.sections !== 'undefined') {
      const parsedSections =
        typeof req.body.sections === 'string'
          ? JSON.parse(req.body.sections)
          : req.body.sections;
      updateObj.sections = normalizeSections(parsedSections);
    }

    if (typeof req.body.imageUrl !== 'undefined') {
      updateObj.imageUrl = req.body.imageUrl;
    }

    if (req.file) {
      updateObj.imageUrl = await uploadToCloudinary(req.file.buffer);
    }

    const updated = await blogService.updateBlogById(id, updateObj, ObjectId);
    if (!updated) return res.status(404).json({ error: 'Blog not found' });

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

// Get all blogs
async function getAllBlogs(req, res, next) {
  try {
    const blogs = await blogService.getAllBlogs();
    res.json(blogs);
  } catch (error) {
    next(error);
  }
}

// Get blog by ID
async function getBlogById(req, res, next) {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid blog id' });

    const blog = await blogService.getBlogById(id, ObjectId);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    res.json(blog);
  } catch (error) {
    next(error);
  }
}

// Delete blog by ID
async function deleteBlogById(req, res, next) {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid blog id' });

    const result = await blogService.deleteBlogById(id, ObjectId);
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Blog not found' });

    res.json({ deletedCount: 1 });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadSingleImage, // multer middleware
  uploadImage,       // dedicated image upload route
  createBlog,
  updateBlogById,
  getAllBlogs,
  getBlogById,
  deleteBlogById,
};
