const { ObjectId } = require('mongodb');
const { getCloudinary } = require('../config/cloudinary');
const portfolioService = require('../services/portfolioService');

async function uploadImage(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file uploaded' });

    const cloudinary = getCloudinary();
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'advera_portfolio' },
      (error, result) => {
        if (error) return next(error);
        return res.json({
          imageUrl: result.secure_url,
          publicId: result.public_id
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    next(error);
  }
}

function validateChallenges(challenges) {
  if (!Array.isArray(challenges)) return [];

  return challenges
    .filter(
      (item) =>
        item &&
        (item.heading || item.subheading || item.paragraph || item.quote)
    )
    .map((item) => ({
      heading: item.heading || '',
      subheading: item.subheading || '',
      paragraph: item.paragraph || '',
      quote: item.quote || null
    }));
}

function validateMainChallenge(mainChallenge) {
  if (!mainChallenge) return null;

  return {
    heading: mainChallenge.heading || '',
    subheading: mainChallenge.subheading || '',
    paragraph: mainChallenge.paragraph || ''
  };
}

async function createPortfolio(req, res, next) {
  try {
    const {
      title,
      subtitle,
      imageUrl,
      introduction,
      mainChallenge, 
      challenges,
      portfolioAuthorName, 
      portfolioAuthorTitle, 
      quote,
      quoteAuthor,
      quoteTitle
    } = req.body;

    if (!title || !subtitle || !imageUrl || !introduction) {
      return res.status(400).json({
        error: 'title, subtitle, imageUrl and introduction are required'
      });
    }

    const normalizedChallenges = validateChallenges(challenges);
    const normalizedMainChallenge = validateMainChallenge(mainChallenge);

    const newPortfolio = {
      title,
      subtitle,
      imageUrl,
      introduction,
      mainChallenge: normalizedMainChallenge, 
      challenges: normalizedChallenges,
      portfolioAuthorName: portfolioAuthorName || null, 
      portfolioAuthorTitle: portfolioAuthorTitle || null, 
      quote: quote || null,
      quoteAuthor: quoteAuthor || null,
      quoteTitle: quoteTitle || null,

      createdAt: new Date(),
      updatedAt: new Date()
    };

    const inserted = await portfolioService.createPortfolio(newPortfolio);

    res.status(201).json(inserted);
  } catch (error) {
    next(error);
  }
}

async function getAllPortfolios(req, res, next) {
  try {
    const portfolios = await portfolioService.getAllPortfolios();
    res.json(portfolios);
  } catch (error) {
    next(error);
  }
}

async function getPortfolioById(req, res, next) {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id))
      return res.status(400).json({ error: 'Invalid portfolio id' });

    const portfolio = await portfolioService.getPortfolioById(
      id,
      ObjectId
    );

    if (!portfolio)
      return res.status(404).json({ error: 'Portfolio not found' });

    res.json(portfolio);
  } catch (error) {
    next(error);
  }
}

async function updatePortfolioById(req, res, next) {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id))
      return res.status(400).json({ error: 'Invalid portfolio id' });

    const {
      title,
      subtitle,
      imageUrl,
      introduction,
      mainChallenge, 
      challenges,
      portfolioAuthorName, 
      portfolioAuthorTitle, 
      quote,
      quoteAuthor,
      quoteTitle
    } = req.body;

    const updateObj = {
      updatedAt: new Date()
    };

    if (title) updateObj.title = title;
    if (subtitle) updateObj.subtitle = subtitle;
    if (imageUrl) updateObj.imageUrl = imageUrl;
    if (introduction) updateObj.introduction = introduction;

    if (mainChallenge)
      updateObj.mainChallenge = validateMainChallenge(mainChallenge); 

    if (challenges)
      updateObj.challenges = validateChallenges(challenges);

    if (typeof portfolioAuthorName !== 'undefined')
      updateObj.portfolioAuthorName = portfolioAuthorName;

    if (typeof portfolioAuthorTitle !== 'undefined')
      updateObj.portfolioAuthorTitle = portfolioAuthorTitle;

    if (typeof quote !== 'undefined') updateObj.quote = quote;
    if (typeof quoteAuthor !== 'undefined')
      updateObj.quoteAuthor = quoteAuthor;

    if (typeof quoteTitle !== 'undefined')
      updateObj.quoteTitle = quoteTitle;

    const updated = await portfolioService.updatePortfolioById(
      id,
      updateObj,
      ObjectId
    );

    if (!updated)
      return res.status(404).json({ error: 'Portfolio not found' });

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function deletePortfolioById(req, res, next) {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id))
      return res.status(400).json({ error: 'Invalid portfolio id' });

    const result =
      await portfolioService.deletePortfolioById(id, ObjectId);

    if (result.deletedCount === 0)
      return res.status(404).json({ error: 'Portfolio not found' });

    res.json({ deletedCount: 1 });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadImage,
  createPortfolio,
  getAllPortfolios,
  getPortfolioById,
  updatePortfolioById,
  deletePortfolioById
};