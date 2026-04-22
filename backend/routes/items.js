const express = require('express');
const db = require('../database');
const auth = require('../middleware/auth');
const { sendPushToAll } = require('../push');

const router = express.Router();

// Get all items (open + claimed + done last 24h)
router.get('/', auth, (req, res) => {
  const items = db.prepare(`
    SELECT
      i.id, i.text, i.quantity, i.status, i.created_at, i.done_at,
      u1.username AS created_by_name,
      u2.username AS claimed_by_name,
      i.created_by, i.claimed_by
    FROM items i
    JOIN users u1 ON i.created_by = u1.id
    LEFT JOIN users u2 ON i.claimed_by = u2.id
    WHERE i.status != 'done'
      OR (i.status = 'done' AND i.done_at > datetime('now', '-1 day'))
    ORDER BY
      CASE i.status WHEN 'open' THEN 0 WHEN 'claimed' THEN 1 ELSE 2 END,
      i.created_at ASC
  `).all();
  res.json(items);
});

// Add item
router.post('/', auth, (req, res) => {
  const { text, quantity, saveFavorite } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Text erforderlich' });
  }

  const result = db.prepare(
    'INSERT INTO items (text, quantity, created_by) VALUES (?, ?, ?)'
  ).run(text.trim(), quantity?.trim() || null, req.user.id);

  const item = db.prepare(`
    SELECT i.*, u1.username AS created_by_name, u2.username AS claimed_by_name
    FROM items i
    JOIN users u1 ON i.created_by = u1.id
    LEFT JOIN users u2 ON i.claimed_by = u2.id
    WHERE i.id = ?
  `).get(result.lastInsertRowid);

  // Save as favorite if requested
  if (saveFavorite) {
    db.prepare('INSERT OR IGNORE INTO favorites (user_id, text) VALUES (?, ?)').run(req.user.id, text.trim());
  }

  // Push notification to all other users
  sendPushToAll(req.user.id, {
    title: '🛒 Einkaufsliste',
    body: `${req.user.username} hat "${text.trim()}" hinzugefügt`,
  });

  res.json(item);
});

// Claim / unclaim item
router.patch('/:id/claim', auth, (req, res) => {
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Artikel nicht gefunden' });
  if (item.status === 'done') return res.status(400).json({ error: 'Artikel bereits erledigt' });

  // If already claimed by this user → unclaim
  if (item.claimed_by === req.user.id) {
    db.prepare("UPDATE items SET claimed_by = NULL, status = 'open' WHERE id = ?").run(item.id);
  } else {
    // Claim it
    db.prepare("UPDATE items SET claimed_by = ?, status = 'claimed' WHERE id = ?").run(req.user.id, item.id);
  }

  const updated = db.prepare(`
    SELECT i.*, u1.username AS created_by_name, u2.username AS claimed_by_name
    FROM items i
    JOIN users u1 ON i.created_by = u1.id
    LEFT JOIN users u2 ON i.claimed_by = u2.id
    WHERE i.id = ?
  `).get(item.id);

  res.json(updated);
});

// Mark item as done
router.patch('/:id/done', auth, (req, res) => {
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Artikel nicht gefunden' });

  db.prepare("UPDATE items SET status = 'done', done_at = CURRENT_TIMESTAMP WHERE id = ?").run(item.id);

  const updated = db.prepare(`
    SELECT i.*, u1.username AS created_by_name, u2.username AS claimed_by_name
    FROM items i
    JOIN users u1 ON i.created_by = u1.id
    LEFT JOIN users u2 ON i.claimed_by = u2.id
    WHERE i.id = ?
  `).get(item.id);

  res.json(updated);
});

// Delete item
router.delete('/:id', auth, (req, res) => {
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Artikel nicht gefunden' });

  // Only creator or claimer can delete
  if (item.created_by !== req.user.id && item.claimed_by !== req.user.id) {
    return res.status(403).json({ error: 'Keine Berechtigung' });
  }

  db.prepare('DELETE FROM items WHERE id = ?').run(item.id);
  res.json({ success: true });
});

module.exports = router;
