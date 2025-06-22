"use strict";
// backend/ts/app.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// --- Middleware ---
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// 1) JS-Client (Signup/Login)
app.use('/js/client/modules/auth', express_1.default.static(path_1.default.join(__dirname, '..', '..', 'js', 'client', 'modules', 'auth')));
// 2) Front-end JS
app.use('/js', express_1.default.static(path_1.default.join(__dirname, '..', '..', 'frontend', 'js')));
// 3) Styles
app.use('/styles', express_1.default.static(path_1.default.join(__dirname, '..', '..', 'frontend', 'styles')));
// 4) Components
app.use('/components', express_1.default.static(path_1.default.join(__dirname, '..', '..', 'frontend', 'components')));
// 5) Images
app.use('/assets/images', express_1.default.static(path_1.default.join(__dirname, '..', '..', 'frontend', 'assets', 'images')));
// 6) HTML-Seiten
app.use(express_1.default.static(path_1.default.join(__dirname, '..', '..', 'frontend', 'html')));
// 7) Forum-Uploads
app.use('/uploads/forum', express_1.default.static(path_1.default.join(__dirname, '..', '..', 'frontend', 'assets', 'images', 'uploads', 'forum')));
// --- Daten-Helper ---
const POSTS_FILE = path_1.default.resolve(__dirname, '..', 'data', 'posts.json');
/** liest posts.json und füllt likes/comments mit Default-Werten */
function loadPosts() {
    let raw = [];
    try {
        raw = JSON.parse(fs_1.default.readFileSync(POSTS_FILE, 'utf-8'));
    }
    catch {
        raw = [];
    }
    return raw.map(p => ({
        id: p.id,
        title: p.title,
        details: p.details,
        tags: Array.isArray(p.tags) ? p.tags : [],
        imageUrl: p.imageUrl ?? null,
        createdAt: p.createdAt,
        likes: typeof p.likes === 'number' ? p.likes : 0,
        comments: Array.isArray(p.comments) ? p.comments : []
    }));
}
/** schreibt das aktuelle Post-Array in posts.json */
function savePosts(posts) {
    fs_1.default.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf-8');
}
// --- Multer für Bild-Uploads ---
const forumStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, path_1.default.join(__dirname, '..', '..', 'frontend', 'assets', 'images', 'uploads', 'forum'));
    },
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
        cb(null, unique);
    }
});
const upload = (0, multer_1.default)({ storage: forumStorage });
// --- Forum-API ---
// GET alle Posts
app.get('/api/posts', (_req, res) => {
    const posts = loadPosts();
    res.json(posts);
});
// POST neuer Post (mit optionalem Bild)
app.post('/api/posts', upload.single('image'), (req, res) => {
    const { title, details, tags } = req.body;
    const imageUrl = req.file ? `/uploads/forum/${req.file.filename}` : null;
    const posts = loadPosts();
    const newPost = {
        id: Date.now(),
        title,
        details,
        tags: typeof tags === 'string'
            ? tags.split(',').map((t) => t.trim())
            : Array.isArray(tags)
                ? tags
                : [],
        imageUrl,
        createdAt: new Date().toISOString(),
        likes: 0, // default auf 0
        comments: [] // default leeres Array
    };
    posts.unshift(newPost);
    savePosts(posts);
    res.status(201).json(newPost);
});
// PUT Like inkrementieren
app.put('/api/posts/:id/like', (req, res) => {
    const posts = loadPosts();
    const post = posts.find(p => p.id === +req.params.id);
    if (!post) {
        res.status(404).json({ error: 'Post nicht gefunden' });
        return;
    }
    post.likes++;
    savePosts(posts);
    res.json({ likes: post.likes });
});
// POST Kommentar anlegen
app.post('/api/posts/:id/comments', (req, res) => {
    const { author, text } = req.body;
    if (!text) {
        res.status(400).json({ error: 'Kein Kommentartext' });
        return;
    }
    const posts = loadPosts();
    const post = posts.find(p => p.id === +req.params.id);
    if (!post) {
        res.status(404).json({ error: 'Post nicht gefunden' });
        return;
    }
    const comment = {
        author: author || 'Anonym',
        text,
        createdAt: new Date().toISOString()
    };
    post.comments.push(comment);
    savePosts(posts);
    res.status(201).json(comment);
});
// Root → index.html
const serveIndex = (_req, res) => {
    res.sendFile(path_1.default.join(__dirname, '..', '..', 'frontend', 'html', 'index.html'));
};
app.get('/', serveIndex);
// Auth-Routes & Health-Check
app.use('/api', routes_1.default);
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});
// Server starten
const PORT = parseInt(process.env.PORT || '3000', 10);
app.listen(PORT, () => {
    console.log(`🚀 Backend läuft auf http://localhost:${PORT}`);
});
