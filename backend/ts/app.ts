import express, { Request, Response, RequestHandler, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import authRoutes from './routes';
import fs from 'fs';
import multer from 'multer';

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

// Forum-Uploads
app.use(
  '/uploads/forum',
  express.static(
    path.join(__dirname, '..', '..', 'frontend', 'assets', 'images', 'uploads', 'forum')
  )
);

// Pfad zur posts.json
const POSTS_FILE = path.resolve(__dirname, '..', 'data', 'posts.json');

// Helpers: load / save
function loadPosts(): any[] {
  try { return JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8')); }
  catch { return []; }
}
function savePosts(posts: any[]): void {
  fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
}

// Multer für Bild-Upload
const forumStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'frontend', 'assets', 'images', 'uploads', 'forum'));
  },
  filename: (_req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage: forumStorage });

// API: Forum
app.get('/api/posts', (_req, res) => {
  res.json(loadPosts());
});

app.post('/api/posts', upload.single('image'), (req, res) => {
  const { title, details, tags } = req.body;
  const imageUrl = req.file ? `/uploads/forum/${req.file.filename}` : null;
  const posts = loadPosts();
  const newPost = {
    id: Date.now(),
    title,
    details,
    tags: tags ? tags.split(',').map((t:string)=>t.trim()) : [],
    imageUrl,
    createdAt: new Date().toISOString(),
    likes: 0,
    comments: [] as {author:string;text:string;createdAt:string}[]
  };
  posts.unshift(newPost);
  savePosts(posts);
  res.status(201).json(newPost);
});

app.put(
  '/api/posts/:id/like',
  (req: Request, res: Response, next: NextFunction) => {
    const posts = loadPosts();
    const post = posts.find(p => p.id === +req.params.id);
    if (!post) return res.status(404).json({ error: 'Post nicht gefunden' });
    post.likes++;
    savePosts(posts);
    return res.json({ likes: post.likes });
  }
);

app.post(
  '/api/posts/:id/comments',
  (req: Request, res: Response, next: NextFunction) => {
    const { author, text } = req.body;
    if (!text) return res.status(400).json({ error: 'Kein Kommentartext' });
    const posts = loadPosts();
    const post = posts.find(p => p.id === +req.params.id);
    if (!post) return res.status(404).json({ error: 'Post nicht gefunden' });
    const comment = { author: author||'Anonym', text, createdAt: new Date().toISOString() };
    post.comments.push(comment);
    savePosts(posts);
    return res.status(201).json(comment);
  }
);

// Root-Handler
const serveIndex: RequestHandler = (_req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'html', 'index.html'));
};
app.get('/', serveIndex);

// Auth-Routes & Health
app.use('/api', authRoutes);
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = parseInt(process.env.PORT||'3000', 10);
app.listen(PORT, () => console.log(`🚀 Backend läuft auf http://localhost:${PORT}`));
