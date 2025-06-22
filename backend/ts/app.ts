// backend/ts/app.ts
import express, { Request, Response} from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import authRoutes from './routes';
import fs from 'fs';
import multer from 'multer';

dotenv.config();
const app = express();

// ---- Middleware ----
app.use(cors());
app.use(express.json());

// 1) Client-JS (Signup/Login)
app.use(
  '/js/client/modules/auth',
  express.static(path.join(__dirname, '..', '..', 'js', 'client', 'modules', 'auth'))
);

// 2) Front-end JS-Module & Utils
app.use(
  '/js',
  express.static(path.join(__dirname, '..', '..', 'frontend', 'js'))
);

// 3) Stylesheets
app.use(
  '/styles',
  express.static(path.join(__dirname, '..', '..', 'frontend', 'styles'))
);

// 4) Komponenten (Header, Navbar…)
app.use(
  '/components',
  express.static(path.join(__dirname, '..', '..', 'frontend', 'components'))
);

// 5) Bilder
app.use(
  '/assets/images',
  express.static(path.join(__dirname, '..', '..', 'frontend', 'assets', 'images'))
);

app.use(
  '/uploads',
  express.static(path.join(__dirname, '..', '..', 'frontend', 'assets', 'images', 'uploads'))
);

// 6) HTML-Seiten
app.use(
  express.static(path.join(__dirname, '..', '..', 'frontend', 'html'))
);

// ---- Forum (Posts) ----
const POSTS_FILE = path.resolve(__dirname, '..', 'data', 'posts.json');

function loadPosts(): any[] {
  try { return JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8')); }
  catch { return []; }
}
function savePosts(posts: any[]): void {
  fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf-8');
}

// Bild-Upload für Forum
const forumStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'frontend', 'assets', 'images', 'uploads', 'forum'));
  },
  filename: (_req, file, cb) => {
    const name = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, name);
  }
});
const upload = multer({ storage: forumStorage });

app.get('/api/posts', (_req: Request, res: Response) => {
  res.json(loadPosts());
});

app.post(
  '/api/posts',
  upload.single('image'),
  (req: Request, res: Response) => {
    const { title, details, tags } = req.body;
    const posts = loadPosts();
    const newPost = {
      id: Date.now(),
      title,
      details,
      tags: typeof tags === 'string' ? tags.split(',').map((t:string)=>t.trim()) : [],
      imageUrl: req.file ? `/uploads/forum/${req.file.filename}` : null,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: []
    };
    posts.unshift(newPost);
    savePosts(posts);
    res.status(201).json(newPost);
  }
);

// ==== Feedback-Pfad und -Helper ====

const FEEDBACK_FILE = path.resolve(__dirname, '..', 'data', 'feedback.json');

function loadFeedback(): any[] {
  try {
    return JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveFeedback(entries: any[]) {
  fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(entries, null, 2));
}

app.post('/api/feedback', (req: Request, res: Response): void => {
  const { rating, feedbackText } = req.body;

  if (!rating || !feedbackText) {
    res.status(400).json({ error: 'Bewertung und Text erforderlich' });
    return;
  }

  // Speichern in feedback.json
  const filePath = path.join(__dirname, '..', 'data', 'feedback.json');
  const feedbackList = fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    : [];

  feedbackList.push({
    rating,
    feedbackText,
    createdAt: new Date().toISOString(),
  });

  fs.writeFileSync(filePath, JSON.stringify(feedbackList, null, 2));
  res.status(201).json({ message: 'Feedback gespeichert' });
});

// --- Dummy-Gamification-Route für Frontend-Tests ---
app.get('/api/gamification/stats', (_req: Request, res: Response) => {
  res.json({
    points: 450,
    level: 5
  });
});

// --- Leaderboard ----
app.get('/api/gamification/leaderboard', (_req: Request, res: Response) => {
  const filePath = path.join(__dirname, '..', 'data', 'userStats.json');

  fs.readFile(filePath, 'utf-8', (err, rawData) => {
    if (err) {
      console.error('Fehler beim Lesen der Rangliste:', err);
      return res.status(500).json({ error: 'Interner Serverfehler' });
    }

    try {
      const data = JSON.parse(rawData);
      res.json(data);
    } catch (parseError) {
      console.error('Fehler beim Parsen der Rangliste:', parseError);
      res.status(500).json({ error: 'Fehler beim Parsen der Rangliste' });
    }
  });
});

// ==== Healthcheck & Start ====
app.use('/api', authRoutes);
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});
const PORT = parseInt(process.env.PORT || '3000', 10);
app.listen(PORT, () => {
  console.log(`🚀 Backend läuft auf http://localhost:${PORT}`);
});