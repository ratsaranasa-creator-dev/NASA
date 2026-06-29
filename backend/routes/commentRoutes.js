const express = require('express');
const router = express.Router();
const { 
  getProjectComments, 
  createComment, 
  deleteComment 
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

// Public route to view comments
router.get('/project/:projectId', getProjectComments);

// Protected routes for authenticated users (citizens/admins)
router.post('/', protect, createComment);
router.delete('/:id', protect, deleteComment);

module.exports = router;
