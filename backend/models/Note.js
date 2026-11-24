const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, default: 'Untitled Note' },
    content: { type: String, default: '' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    folder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
    tags: [{ type: String, trim: true }],
    isPinned: { type: Boolean, default: false },
    isTrashed: { type: Boolean, default: false },
    shareToken: { type: String, default: null },
    lastOpenedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Text index for fast search by title and content
noteSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Note', noteSchema);