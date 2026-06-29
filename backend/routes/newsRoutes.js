const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, admin, newsController.createNews);
router.get('/', newsController.getNews);
router.get('/:id', newsController.getNewsById);
router.put('/:id', protect, admin, newsController.updateNews);
router.delete('/:id', protect, admin, newsController.deleteNews);

module.exports = router;
