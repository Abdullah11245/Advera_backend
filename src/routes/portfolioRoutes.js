const express = require('express');
const multer = require('multer');
const portfolioController = require('../controllers/portfolioController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', portfolioController.getAllPortfolios);
router.get('/:id', portfolioController.getPortfolioById);
router.post('/', portfolioController.createPortfolio);
router.put('/:id', portfolioController.updatePortfolioById);
router.delete('/:id', portfolioController.deletePortfolioById);
router.post('/upload-image', upload.single('image'), portfolioController.uploadImage);

module.exports = router;
