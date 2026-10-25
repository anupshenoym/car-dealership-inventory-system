import app from '../src/app';

// Vercel serverless entry point. All requests are rewritten here by vercel.json,
// and Express handles the original /api/* path.
export default app;
