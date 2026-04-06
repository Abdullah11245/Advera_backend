const express = require('express');
const blogController = require('../controllers/blogController');

const router = express.Router();

// CRUD routes
router.get('/', blogController.getAllBlogs);
router.get('/:id', blogController.getBlogById);
router.post('/', blogController.uploadSingleImage, blogController.createBlog); // create blog with image
router.put('/:id', blogController.uploadSingleImage, blogController.updateBlogById); // update blog with optional image
router.delete('/:id', blogController.deleteBlogById);

// Dedicated image upload route
router.post('/upload-image', blogController.uploadSingleImage, blogController.uploadImage);

module.exports = router;