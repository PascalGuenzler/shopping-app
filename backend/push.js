const webpush = require('web-push');
const db = require('./database');

// Generate VAPID keys once: node -e "const wp=require('web-push'); const k=wp.generateVAPIDKeys(); console.log(k)"
// For localhost we use fixed test keys or generate dynamically
let vapidInitialized = false;

function initVapid() {
  if (vapidInitialized) return;
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      'mailto:admin@shopping-app.local',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    vapidInitialized = true;
  }
}

function getVapidPublicKey() {
  return process.env.VAPID_PUBLIC_KEY || null;
}

async function sendPushToAll(excludeUserId, payload) {
  if (!vapidInitialized) return;

  const subscriptions = db.prepare(
    'SELECT * FROM push_subscriptions WHERE user_id != ?'
  ).all(excludeUserId);

  for (const row of subscriptions) {
    try {
      await webpush.sendNotification(JSON.parse(row.subscription), JSON.stringify(payload));
    } catch (err) {
      // Subscription expired or invalid → remove it
      if (err.statusCode === 410 || err.statusCode === 404) {
        db.prepare('DELETE FROM push_subscriptions WHERE id = ?').run(row.id);
      }
    }
  }
}

module.exports = { initVapid, getVapidPublicKey, sendPushToAll };
