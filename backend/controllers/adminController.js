const User = require('../models/User');

// @desc    Get all pending citizen requests
// @route   GET /api/admin/pending-citizens
// @access  Private/Admin
exports.getPendingCitizens = async (req, res) => {
  try {
    const users = await User.find({ role: 'CITOYEN', status: 'PENDING' });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve/Reject citizen request
// @route   PUT /api/admin/citizen-status/:id
// @access  Private/Admin
exports.updateCitizenStatus = async (req, res) => {
  const { status } = req.body; // 'APPROVED' or 'REJECTED'

  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.status = status;
      await user.save();
      res.json({ message: `Citizen status updated to ${status}` });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
