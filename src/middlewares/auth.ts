import { Request, Response, NextFunction } from 'express';
import db from '../db/database';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = db.prepare('SELECT * FROM users WHERE token = ?').get(token) as any;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  (req as any).user = user;
  next();
}
