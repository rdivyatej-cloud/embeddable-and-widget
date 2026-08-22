import { Router } from 'express';
import db from '../db/database';
import { authMiddleware } from '../middlewares/auth';
import { z } from 'zod';

const router = Router();

const widgetSchema = z.object({
  title: z.string().min(1),
  button_text: z.string().min(1),
  type: z.string()
});

// Authenticated CRUD for widgets
router.use(authMiddleware);

router.get('/', (req, res) => {
  const userId = (req as any).user.id;
  const widgets = db.prepare('SELECT * FROM widgets WHERE owner_id = ?').all(userId);
  res.json(widgets);
});

router.post('/', (req, res) => {
  const userId = (req as any).user.id;
  const parseResult = widgetSchema.safeParse(req.body);
  
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.errors });
  }
  
  const id = Math.random().toString(36).substring(2, 9);
  db.prepare('INSERT INTO widgets (id, owner_id, title, button_text, type) VALUES (?, ?, ?, ?, ?)').run(
    id, userId, parseResult.data.title, parseResult.data.button_text, parseResult.data.type
  );
  
  res.status(201).json({ id, ...parseResult.data });
});

export default router;
