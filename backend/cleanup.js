const cron = require('node-cron');
const db = require('./database');

function startCleanupJob() {
  // Run every hour: delete done items older than 24 hours
  cron.schedule('0 * * * *', () => {
    const result = db.prepare(
      "DELETE FROM items WHERE status = 'done' AND done_at < datetime('now', '-1 day')"
    ).run();
    if (result.changes > 0) {
      console.log(`[Cleanup] ${result.changes} erledigte Artikel gelöscht`);
    }
  });

  console.log('[Cleanup] Job gestartet (stündlich)');
}

module.exports = { startCleanupJob };
