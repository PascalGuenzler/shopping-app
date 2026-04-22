const express = require('express');
const db = require('../database');
const auth = require('../middleware/auth');

const router = express.Router();

// Save push subscription
router.post('/subscribe', auth, (req, res) => {
  const { subscription } = req.body;
  if (!subscription) return res.status(400).json({ error: 'Subscription erforderlich' });

  const subStr = JSON.stringify(subscription);
  db.prepare('INSERT OR REPLACE INTO push_subscriptions (user_id, subscription) VALUES (?, ?)').run(req.user.id, subStr);
  res.json({ success: true });
});

// Remove push subscription
router.post('/unsubscribe', auth, (req, res) => {
  const { subscription } = req.body;
  if (!subscription) return res.status(400).json({ error: 'Subscription erforderlich' });

  const subStr = JSON.stringify(subscription);
  db.prepare('DELETE FROM push_subscriptions WHERE user_id = ? AND subscription = ?').run(req.user.id, subStr);
  res.json({ success: true });
});

module.exports = router;
