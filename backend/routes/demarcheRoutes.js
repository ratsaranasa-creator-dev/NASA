const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const demarcheController = require('../controllers/demarcheController');
const { protect, admin } = require('../middleware/authMiddleware');

// Multer Memory Storage (files uploaded to Cloudinary from memory)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf', 
    'image/jpeg', 
    'image/png', 
    'image/webp'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format non supporté. Utilisez PDF, JPG, PNG ou WEBP.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Public routes
router.get('/', demarcheController.getDemarches);
router.get('/:id', demarcheController.getDemarcheById);

// Protected Admin routes
router.use(protect);
router.use(admin);

router.post('/', demarcheController.createDemarche);
router.put('/:id', demarcheController.updateDemarche);
router.delete('/:id', demarcheController.deleteDemarche);
router.post('/upload', upload.single('file'), demarcheController.uploadDocument);

module.exports = router;
