const express = require('express');
const router = express.Router();
const { getCitizenData, submitRequest } = require('../controllers/citizenController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/me', getCitizenData);
router.post('/request', submitRequest);

module.exports = router;
