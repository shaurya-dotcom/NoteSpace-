const express = require('express');
const crypto = require('crypto');
const Note = require('../models/Note');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// PUBLIC ROUTE: View shared note via crypto token (No login required)
router.get('/public/:token', async (req, res) => {
  try {
    const note = await Note.findOne({ shareToken: req.params.token, isTrashed: false })
      .populate('user', 'name');
    if (!note) return res.status(404).json({ message: 'Shared note not found or link revoked' });
    res.json({
      title: note.title,
      content: note.content,
      tags: note.tags,
      author: note.user?.name || 'Anonymous',
      updatedAt: note.updatedAt
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Protected routes below
router.use(verifyToken);

// Get active notes (supports ?folder=id, ?tag=name, ?search=query)
router.get('/', async (req, res) => {
  try {
    const { folder, tag, search } = req.query;
    const filter = { user: req.user.id, isTrashed: false };

    if (folder) filter.folder = folder === 'root' ? null : folder;
    if (tag) filter.tags = tag;
    if (search && search.trim()) {
      filter.$text = { $search: search.trim() };
    }

    const notes = await Note.find(filter).sort({ isPinned: -1, updatedAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UNIQUE TWIST: "Revise today" list (notes not opened for 7+ days)
router.get('/revise-today', async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const notes = await Note.find({
      user: req.user.id,
      isTrashed: false,
      lastOpenedAt: { $lte: sevenDaysAgo }
    }).sort({ lastOpenedAt: 1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Trashed notes
router.get('/trash', async (req, res) => {
  const notes = await Note.find({ user: req.user.id, isTrashed: true }).sort({ updatedAt: -1 });
  res.json(notes);
});

// Open a single note & reset its lastOpenedAt timestamp
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { lastOpenedAt: new Date() },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create note
router.post('/', async (req, res) => {
  try {
    const note = await Note.create({
      title: req.body.title || 'Untitled Note',
      content: req.body.content || '',
      folder: req.body.folder || null,
      tags: req.body.tags || [],
      user: req.user.id,
      lastOpenedAt: new Date()
    });
    res.status(201).json(note);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update note (title, content, tags, isPinned, folder)
router.put('/:id', async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { ...req.body, lastOpenedAt: new Date() },
      { new: true }
    );
    res.json(note);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Generate or revoke read-only share token using Node crypto
router.post('/:id/share', async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    if (req.body.revoke) {
      note.shareToken = null;
    } else if (!note.shareToken) {
      note.shareToken = crypto.randomBytes(24).toString('hex');
    }
    await note.save();
    res.json({ shareToken: note.shareToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Move to Trash
router.patch('/:id/trash', async (req, res) => {
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { isTrashed: true, isPinned: false },
    { new: true }
  );
  res.json(note);
});

// Restore from Trash
router.patch('/:id/restore', async (req, res) => {
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { isTrashed: false },
    { new: true }
  );
  res.json(note);
});

// Permanently Delete
router.delete('/:id', async (req, res) => {
  await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  res.json({ message: 'Note permanently deleted' });
});

module.exports = router;