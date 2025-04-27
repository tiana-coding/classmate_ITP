import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import authRoutes from './routes';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/js/client', express.static(path.join(__dirname, '../../../../js/client')));
app.use('/styles', express.static(path.join(__dirname, '../../../frontend/styles')));
app.use('/assets/images', express.static(path.join(__dirname, '../../../frontend/assets/images')));
app.use(express.static(path.join(__dirname, '../../../frontend/html')));

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '../../../frontend/html/index.html'));
});

app.use('/api', authRoutes);
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const PORT = parseInt(process.env.PORT || '3000', 10);
app.listen(PORT, () => {
  console.log(`🚀 Backend läuft auf http://localhost:${PORT}`);
});
