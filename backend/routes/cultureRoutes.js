const express = require('express');
const router = express.Router();
const cultureController = require('../controllers/cultureController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', cultureController.getStructures);
router.get('/:id', cultureController.getStructureById);

// Protected Admin routes
router.use(protect);
router.use(admin);

router.post('/', cultureController.createStructure);
router.put('/:id', cultureController.updateStructure);
router.delete('/:id', cultureController.deleteStructure);

// Dedicated upload route for culture
router.post('/upload', upload.single('image'), cultureController.uploadImage);

module.exports = router;
