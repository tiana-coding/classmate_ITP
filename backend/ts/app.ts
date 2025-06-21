import express, { Request, Response, RequestHandler } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import authRoutes from './routes';
import fs from 'fs'; // forum data
import multer from 'multer'; // forum uploads

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// 1) Client‐JS (signup.js & login.js)
app.use(
  '/js/client/modules/auth',
  express.static(path.join(__dirname, '..', '..', 'js', 'client', 'modules', 'auth'))
);

// 2) Front-end JS modules and utils
app.use(
  '/js',
  express.static(path.join(__dirname, '..', '..', 'frontend', 'js'))
);

// 3) Stylesheet
app.use(
  '/styles',
  express.static(path.join(__dirname, '..', '..', 'frontend', 'styles'))
);

// 4) Front-end HTML components
app.use(
  '/components',
  express.static(path.join(__dirname, '..', '..', 'frontend', 'components'))
);

// 5) Images
app.use(
  '/assets/images',
  express.static(path.join(__dirname, '..', '..', 'frontend', 'assets', 'images'))
);

// 6) HTML pages
app.use(
  express.static(path.join(__dirname, '..', '..', 'frontend', 'html'))
);

// --- Forum Uploads statisch bereitstellen ---
// URL: /uploads/forum/<filename>
app.use(
  '/uploads/forum',
  express.static(
    path.join(__dirname, '..', '..', 'frontend', 'assets', 'images', 'uploads', 'forum')
  )
);

// --- Forum: posts.json Pfad ---
// __dirname ist hier euer '.../backend/js'-Ordner nach Build
const POSTS_FILE = path.resolve(__dirname, '..', 'data', 'posts.json');

// Utility: lade Posts aus data/posts.json
function loadPosts() {
  try {
    return JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}
// Utility: speichere Posts in data/posts.json
function savePosts(posts: any[]) {
  fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
}

// Multer konfigurieren für Datei-Upload nach frontend/assets/images/uploads/forum
const forumStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(
      null,
      path.join(__dirname, '..', '..', 'frontend', 'assets', 'images', 'uploads', 'forum')
    );
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, unique);
  }
});
const upload = multer({ storage: forumStorage });

// --- Forum-API Endpunkte ---
// GET /api/posts
app.get('/api/posts', (_req: Request, res: Response) => {
  const posts = loadPosts();
  res.json(posts);
});

// POST /api/posts  (Felder: title, details, tags, image)
app.post(
  '/api/posts',
  upload.single('image'),
  (req: Request, res: Response) => {
    const { title, details, tags } = req.body;
    const imageUrl = req.file ? `/uploads/forum/${req.file.filename}` : null;

    const posts = loadPosts();
    const newPost = {
      id: Date.now(),
      title,
      details,
      tags: tags ? tags.split(',').map((t: string) => t.trim()) : [],
      imageUrl,
      createdAt: new Date().toISOString()
    };

    posts.unshift(newPost);
    savePosts(posts);
    res.status(201).json(newPost);
  }
);

// Typisierter Root-Handler für Index
const serveIndex: RequestHandler = (_req: Request, res: Response) => {
  res.sendFile(
    path.join(__dirname, '..', '..', 'frontend', 'html', 'index.html')
  );
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
