const express = require('express');
const router = express.Router();
const cultureController = require('../controllers/cultureController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, admin, cultureController.createStructure);
router.get('/', cultureController.getStructures);
router.get('/:id', cultureController.getStructureById);
router.put('/:id', protect, admin, cultureController.updateStructure);
router.delete('/:id', protect, admin, cultureController.deleteStructure);

module.exports = router;
