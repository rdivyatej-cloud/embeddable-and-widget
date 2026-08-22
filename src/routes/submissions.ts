import { Router } from 'express';
import cors from 'cors';
import { z } from 'zod';
import db from '../db/database';
import { submissionRateLimiter, honeypotMiddleware } from '../middlewares/abuse';
import { getGeoLocation } from '../services/geo';
import { sendConfirmationEmail } from '../services/email';

const router = Router();

// CORS for public submissions (allow all origins, preflight handled)
router.use(cors({
  origin: '*',
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

const submissionSchema = z.object({
  widget_id: z.string().min(1),
  email: z.string().email(),
  name: z.string().optional(),
  _honeypot: z.string().optional()
});

router.post('/', submissionRateLimiter, honeypotMiddleware, async (req, res) => {
  // Boundary validation
  const parseResult = submissionSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parseResult.error.errors });
  }

  const payload = parseResult.data;
  
  // Verify widget exists
  const widget = db.prepare('SELECT id FROM widgets WHERE id = ?').get(payload.widget_id);
  if (!widget) {
    return res.status(404).json({ error: 'Widget not found' });
  }

  // Geo enrichment
  const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
  const geo = await getGeoLocation(ip);

  // Store submission
  const subId = Math.random().toString(36).substring(2, 11);
  const dataPayload = JSON.stringify({ name: payload.name, email: payload.email });
  
  try {
    db.prepare(`
      INSERT INTO submissions (id, widget_id, data, ip_address, country, city)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(subId, payload.widget_id, dataPayload, ip, geo.country, geo.city);
  } catch (err) {
    console.error('Failed to store submission', err);
    return res.status(500).json({ error: 'Internal server error' });
  }

  // Safe side effect
  sendConfirmationEmail(payload.email, payload.widget_id).catch(() => {});

  res.status(201).json({ success: true, id: subId });
});

export default router;
