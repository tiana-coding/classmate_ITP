import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import authRoutes from './routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// 1) Statische HTML-Dateien
app.use(express.static(path.join(__dirname, '../../frontend/html')));

// 2) Kompilierte JS für Client
app.use('/js/client', express.static(path.join(__dirname, '../../js/client')));

// 3) Stylesheet
app.use('/styles', express.static(path.join(__dirname, '../../frontend/styles')));

// 4) Bilder
app.use('/assets/images', express.static(path.join(__dirname, '../../frontend/assets/images')));

// 5) API-Routen
app.use('/api', authRoutes);

// Health-Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

const PORT = parseInt(process.env.PORT || '3000', 10);
app.listen(PORT, () => {
  console.log(`🚀 Backend läuft auf http://localhost:${PORT}`);
});
