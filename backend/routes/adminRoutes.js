const express = require('express');
const router = express.Router();
const {
  getPendingCitizens,
  updateCitizenStatus,
  getAllUsers,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);
router.use(admin);

router.get('/pending-citizens', getPendingCitizens);
router.put('/citizen-status/:id', updateCitizenStatus);
router.get('/users', getAllUsers);

module.exports = router;
