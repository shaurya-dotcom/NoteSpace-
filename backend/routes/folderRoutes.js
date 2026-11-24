const express = require('express');
const Folder = require('../models/Folder');
const Note = require('../models/Note');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);

// Get all folders for user
router.get('/', async (req, res) => {
  const folders = await Folder.find({ user: req.user.id }).sort({ createdAt: 1 });
  res.json(folders);
});

// Create folder (supports optional parent folder ID)
router.post('/', async (req, res) => {
  try {
    const folder = await Folder.create({
      name: req.body.name,
      parent: req.body.parent || null,
      user: req.user.id
    });
    res.status(201).json(folder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Rename or move folder
router.put('/:id', async (req, res) => {
  const folder = await Folder.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { name: req.body.name, parent: req.body.parent ?? null },
    { new: true }
  );
  res.json(folder);
});

// Delete folder (moves contained notes to root)
router.delete('/:id', async (req, res) => {
  await Folder.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  await Note.updateMany({ folder: req.params.id, user: req.user.id }, { folder: null });
  await Folder.updateMany({ parent: req.params.id, user: req.user.id }, { parent: null });
  res.json({ message: 'Folder deleted' });
});

module.exports = router;