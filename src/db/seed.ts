import db, { initDb } from './database';

console.log('Initializing DB Schema...');
initDb();

console.log('Seeding Demo Data...');
try {
  // Clear tables
  db.exec('DELETE FROM submissions');
  db.exec('DELETE FROM widgets');
  db.exec('DELETE FROM users');

  // Insert test user
  db.prepare('INSERT INTO users (id, username, token) VALUES (?, ?, ?)').run(
    'user-1',
    'demo_user',
    'demo-token-123'
  );

  // Insert test widget
  db.prepare('INSERT INTO widgets (id, owner_id, title, button_text, type) VALUES (?, ?, ?, ?, ?)').run(
    'widget-123',
    'user-1',
    'Join our Newsletter',
    'Subscribe Now',
    'signup'
  );

  console.log('Seed completed successfully!');
  console.log('Test User Token: demo-token-123');
  console.log('Test Widget ID: widget-123');
} catch (err) {
  console.error('Seed failed:', err);
}
