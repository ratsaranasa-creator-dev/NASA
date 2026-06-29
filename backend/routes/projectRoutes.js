const express = require('express');
const router = express.Router();
const { 
  getAllProjects, 
  createProject, 
  updateProject, 
  deleteProject 
} = require('../controllers/projectController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public route to view all projects
router.get('/', getAllProjects);

// Protected routes reserved exclusively for admin
router.post('/', protect, admin, createProject);
router.put('/:id', protect, admin, updateProject);
router.delete('/:id', protect, admin, deleteProject);

module.exports = router;
