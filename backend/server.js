require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { initVapid, getVapidPublicKey } = require('./push');
const { startCleanupJob } = require('./cleanup');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Init VAPID for push notifications
initVapid();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/push', require('./routes/push'));

// VAPID public key endpoint (needed by frontend)
app.get('/api/push/vapid-key', (req, res) => {
  const key = getVapidPublicKey();
  res.json({ key });
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Start cleanup job
startCleanupJob();

app.listen(PORT, () => {
  console.log(`Backend läuft auf http://localhost:${PORT}`);
});
