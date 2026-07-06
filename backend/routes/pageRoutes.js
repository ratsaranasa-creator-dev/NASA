const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getPageContent,
  updatePageContent,
  uploadImage,
  getContentVersions,
  rollbackVersion
} = require('../controllers/pageController');
const { protect, admin } = require('../middleware/authMiddleware');

// Multer Storage Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format d\'image non supporté. Utilisez JPG, PNG, WEBP ou GIF.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Public routes
router.get('/:pageName', getPageContent);

// Protected Admin routes
router.use(protect);
router.use(admin);

router.put('/content', updatePageContent);
router.post('/upload', upload.single('image'), uploadImage);
router.get('/versions/:contentId', getContentVersions);
router.post('/rollback/:versionId', rollbackVersion);

module.exports = router;
