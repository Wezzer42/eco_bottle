// Import Express app (ts) directly; Vercel will bundle dependencies
import app from '../src/app';
import type { IncomingMessage, ServerResponse } from 'http';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  // Delegate to Express app
  // Express app mounts routes under /api/*.
  // Our public entrypoint is /api/backend/*, so normalize the path.
  const url = (req.url || '/');
  if (url.startsWith('/api/backend')) {
    (req as any).url = url.replace('/api/backend', '/api');
  }
  // Cast to any to satisfy types between Node/Vercel and Express
  return (app as any)(req, res);
}


