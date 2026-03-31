const { ObjectId } = require('mongodb');
const blogService = require('../services/blogService');

function normalizeSections(sections) {
  if (!Array.isArray(sections)) {
    throw new Error('sections must be an array');
  }
  return sections.map((item) => ({
    heading: item.heading || '',
    paragraph: item.paragraph || '',
  }));
}

async function createBlog(req, res, next) {
  try {
    const {
      title,
      author,
      datePosted,
      readTime,
      tags,
      subheading,
      paragraph,
      sections,
    } = req.body;

    if (!title || !author || !datePosted || !readTime || !subheading || !paragraph) {
      return res.status(400).json({ error: 'title, author, datePosted, readTime, subheading, paragraph are required' });
    }

    const normalizedTags = Array.isArray(tags) ? tags.filter((t) => t && t.trim()).map((t) => t.trim()) : [];

    const normalizedSections = normalizeSections(sections || []);

    const payload = {
      title,
      author,
      datePosted: new Date(datePosted),
      readTime,
      tags: normalizedTags,
      subheading,
      paragraph,
      sections: normalizedSections,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const created = await blogService.createBlog(payload);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
}

async function getAllBlogs(req, res, next) {
  try {
    const blogs = await blogService.getAllBlogs();
    res.json(blogs);
  } catch (error) {
    next(error);
  }
}

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

async function updateBlogById(req, res, next) {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid blog id' });

    const { title, author, datePosted, readTime, tags, subheading, paragraph, sections } = req.body;

    const updateObj = { updatedAt: new Date() };
    if (title) updateObj.title = title;
    if (author) updateObj.author = author;
    if (datePosted) updateObj.datePosted = new Date(datePosted);
    if (readTime) updateObj.readTime = readTime;
    if (Array.isArray(tags)) updateObj.tags = tags.filter((t) => t && t.trim()).map((t) => t.trim());
    if (subheading) updateObj.subheading = subheading;
    if (paragraph) updateObj.paragraph = paragraph;
    if (sections) updateObj.sections = normalizeSections(sections);

    const updated = await blogService.updateBlogById(id, updateObj, ObjectId);
    if (!updated) return res.status(404).json({ error: 'Blog not found' });

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

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
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlogById,
  deleteBlogById,
};
