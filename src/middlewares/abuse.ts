import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

export const submissionRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export function honeypotMiddleware(req: Request, res: Response, next: NextFunction) {
  // If the honeypot field is filled out, reject the submission silently or return success
  if (req.body && req.body._honeypot) {
    return res.status(200).json({ success: true, message: 'Submission accepted' }); // Silent rejection
  }
  next();
}
