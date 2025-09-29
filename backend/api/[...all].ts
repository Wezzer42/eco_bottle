import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/app';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Normalize path - Vercel routes /api/* to this function
    const originalUrl = req.url || '/';
    
    // Express expects /api/* but Vercel gives us the full path
    if (!originalUrl.startsWith('/api/')) {
      req.url = '/api' + originalUrl;
    }
    
    // Handle the request with Express
    return new Promise((resolve, reject) => {
      app(req as any, res as any, (err: any) => {
        if (err) {
          console.error('Express error:', err);
          reject(err);
        } else {
          resolve(undefined);
        }
      });
    });
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
}


