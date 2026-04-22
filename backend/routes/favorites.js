const express = require('express');
const db = require('../database');
const auth = require('../middleware/auth');

const router = express.Router();

// Get my favorites
router.get('/', auth, (req, res) => {
  const favorites = db.prepare('SELECT * FROM favorites WHERE user_id = ? ORDER BY text ASC').all(req.user.id);
  res.json(favorites);
});

// Add favorite
router.post('/', auth, (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Text erforderlich' });
  }

  try {
    const result = db.prepare('INSERT INTO favorites (user_id, text) VALUES (?, ?)').run(req.user.id, text.trim());
    res.json({ id: result.lastInsertRowid, user_id: req.user.id, text: text.trim() });
  } catch {
    res.status(409).json({ error: 'Favorit bereits vorhanden' });
  }
});

// Delete favorite
router.delete('/:id', auth, (req, res) => {
  const fav = db.prepare('SELECT * FROM favorites WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!fav) return res.status(404).json({ error: 'Favorit nicht gefunden' });

  db.prepare('DELETE FROM favorites WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
