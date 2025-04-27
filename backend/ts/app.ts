import express, { Request, Response, RequestHandler } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import authRoutes from './routes';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// 1) Client‐JS (signup.js & login.js)
app.use(
  '/js/client/modules/auth',
  express.static(path.join(__dirname, '..', '..', 'js', 'client', 'modules', 'auth'))
);

// 2) Styles
app.use(
  '/styles',
  express.static(path.join(__dirname, '..', '..', 'frontend', 'styles'))
);

// 3) Images
app.use(
  '/assets/images',
  express.static(path.join(__dirname, '..', '..', 'frontend', 'assets', 'images'))
);

// 4) HTML-Dateien
app.use(
  express.static(path.join(__dirname, '..', '..', 'frontend', 'html'))
);

// Typisierter Root-Handler
const serveIndex: RequestHandler = (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'html', 'index.html'));
};
app.get('/', serveIndex);

// API-Routen
app.use('/api', authRoutes);
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

const PORT = parseInt(process.env.PORT || '3000', 10);
app.listen(PORT, () => {
  console.log(`🚀 Backend läuft auf http://localhost:${PORT}`);
});
