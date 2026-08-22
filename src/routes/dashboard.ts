import { Router } from 'express';
import db from '../db/database';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.use(authMiddleware);

router.get('/stats', (req, res) => {
  const userId = (req as any).user.id;
  
  // Basic aggregation: count by widget
  const stats = db.prepare(`
    SELECT w.title, w.id, COUNT(s.id) as submission_count
    FROM widgets w
    LEFT JOIN submissions s ON w.id = s.widget_id
    WHERE w.owner_id = ?
    GROUP BY w.id
  `).all(userId);

  res.json({ stats });
});

router.get('/submissions', (req, res) => {
  const userId = (req as any).user.id;
  const widgetId = req.query.widget_id as string;
  
  let submissions;
  if (widgetId) {
    submissions = db.prepare(`
      SELECT s.* FROM submissions s
      JOIN widgets w ON s.widget_id = w.id
      WHERE w.owner_id = ? AND w.id = ?
      ORDER BY s.created_at DESC
    `).all(userId, widgetId);
  } else {
    submissions = db.prepare(`
      SELECT s.* FROM submissions s
      JOIN widgets w ON s.widget_id = w.id
      WHERE w.owner_id = ?
      ORDER BY s.created_at DESC
    `).all(userId);
  }

  // Parse JSON data back to objects
  const parsed = submissions.map((s: any) => ({
    ...s,
    data: s.data ? JSON.parse(s.data) : null
  }));

  res.json({ submissions: parsed });
});

export default router;
