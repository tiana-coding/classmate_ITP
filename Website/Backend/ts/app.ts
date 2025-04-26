import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import authRoutes from './routes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Kompilierte Client‐JS:
// __dirname = .../Website/backend/js/server
// ../../../.. → .../Website
app.use(
  '/js/client',
  express.static(path.join(__dirname, '../../../..', 'js', 'client'))
);

// Styles (frontend/styles):
// from js/server up 3 → .../Website, then frontend/styles
app.use(
  '/styles',
  express.static(path.join(__dirname, '../../../..', 'frontend', 'styles'))
);

// Bilder (frontend/assets/images):
app.use(
  '/assets/images',
  express.static(path.join(__dirname, '../../../..', 'frontend', 'assets', 'images'))
);

// HTML‐Dateien (frontend/html) als letzter Fallback:
app.use(
  express.static(path.join(__dirname, '../../../..', 'frontend', 'html'))
);

// API-Router:
app.use('/api', authRoutes);
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const PORT = parseInt(process.env.PORT || '3000', 10);
app.listen(PORT, () => {
  console.log(`Backend läuft auf http://localhost:${PORT}`);
});