import { createApp } from '../server/app.js';

// A single Express app instance is reused across warm serverless
// invocations (Vercel keeps the module cached between requests).
const app = createApp();

// Vercel's Node.js runtime calls exported request handlers with the
// standard (req, res) signature - an Express app is directly compatible.
export default app;
