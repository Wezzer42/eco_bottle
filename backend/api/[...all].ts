import type { VercelRequest, VercelResponse } from '@vercel/node';
// Import Express app (ts) directly; Vercel will bundle dependencies
import app from '../src/app';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Delegate to Express app
  // Express app already mounts routes under /api/*
  // Vercel will pass the original path (e.g. /api/products) here
  // so no path rewriting is necessary
  // Cast to any to satisfy types between Vercel and Express
  return (app as any)(req, res);
}


