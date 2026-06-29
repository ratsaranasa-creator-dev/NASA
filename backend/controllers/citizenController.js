const User = require('../models/User');

// @desc    Get citizen data
// @route   GET /api/citizen/me
// @access  Private/Citizen
exports.getCitizenData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit a request
// @route   POST /api/citizen/request
// @access  Private/Citizen
exports.submitRequest = async (req, res) => {
  // Logic for submitting a form/request
  res.json({ message: 'Demande soumise avec succès !' });
};
