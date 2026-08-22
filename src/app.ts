import express from 'express';
import cors from 'cors';
import path from 'path';
import { initDb } from './db/database';
import db from './db/database';
import widgetsRouter from './routes/widgets';
import submissionsRouter from './routes/submissions';
import dashboardRouter from './routes/dashboard';

const app = express();
app.use(express.json({ limit: '10kb' })); // Protect against oversized payloads

// Initialize Database (if not in test mode, handled elsewhere or safe to call)
initDb();

// Main API Routes
app.use('/api/widgets', widgetsRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/dashboard', dashboardRouter);

// Cached Widget Config Delivery
app.get('/api/widgets/:id/config', cors({ origin: '*' }), (req, res) => {
  const widget = db.prepare('SELECT * FROM widgets WHERE id = ?').get(req.params.id);
  if (!widget) {
    return res.status(404).json({ error: 'Widget not found' });
  }
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.json(widget);
});

// Serve versioned widget script
app.use('/widget.js', (req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  next();
}, express.static(path.join(__dirname, 'public/widget.js')));

export default app;
