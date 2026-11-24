const express = require('express');
const User = require('../models/User');
const Note = require('../models/Note');
const Folder = require('../models/Folder');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken, verifyAdmin);

// Get platform stats & all users
router.get('/dashboard', async (req, res) => {
  const users = await User.find().select('-password -refreshToken').sort({ createdAt: -1 });
  const totalNotes = await Note.countDocuments();
  const totalFolders = await Folder.countDocuments();
  res.json({
    stats: { totalUsers: users.length, totalNotes, totalFolders },
    users
  });
});

// Delete a user and their data
router.delete('/users/:id', async (req, res) => {
  await Note.deleteMany({ user: req.params.id });
  await Folder.deleteMany({ user: req.params.id });
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User and data removed' });
});

module.exports = router;