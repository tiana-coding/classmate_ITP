"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const fs_1 = __importDefault(require("fs")); // forum data
const multer_1 = __importDefault(require("multer")); // forum uploads
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// 1) Client‐JS (signup.js & login.js)
app.use('/js/client/modules/auth', express_1.default.static(path_1.default.join(__dirname, '..', '..', 'js', 'client', 'modules', 'auth')));
// 2) Front-end JS modules and utils
app.use('/js', express_1.default.static(path_1.default.join(__dirname, '..', '..', 'frontend', 'js')));
// 3) Stylesheet
app.use('/styles', express_1.default.static(path_1.default.join(__dirname, '..', '..', 'frontend', 'styles')));
// 4) Front-end HTML components
app.use('/components', express_1.default.static(path_1.default.join(__dirname, '..', '..', 'frontend', 'components')));
// 5) Images
app.use('/assets/images', express_1.default.static(path_1.default.join(__dirname, '..', '..', 'frontend', 'assets', 'images')));
// 6) HTML pages
app.use(express_1.default.static(path_1.default.join(__dirname, '..', '..', 'frontend', 'html')));
// --- Forum Uploads statisch bereitstellen ---
// URL: /uploads/forum/<filename>
app.use('/uploads/forum', express_1.default.static(path_1.default.join(__dirname, '..', '..', 'frontend', 'assets', 'images', 'uploads', 'forum')));
// --- Forum: posts.json Pfad ---
// __dirname ist hier euer '.../backend/js'-Ordner nach Build
const POSTS_FILE = path_1.default.resolve(__dirname, '..', 'data', 'posts.json');
// Utility: lade Posts aus data/posts.json
function loadPosts() {
    try {
        return JSON.parse(fs_1.default.readFileSync(POSTS_FILE, 'utf-8'));
    }
    catch {
        return [];
    }
}
// Utility: speichere Posts in data/posts.json
function savePosts(posts) {
    fs_1.default.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
}
// Multer konfigurieren für Datei-Upload nach frontend/assets/images/uploads/forum
const forumStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, path_1.default.join(__dirname, '..', '..', 'frontend', 'assets', 'images', 'uploads', 'forum'));
    },
    filename: (_req, file, cb) => {
        const unique = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
        cb(null, unique);
    }
});
const upload = (0, multer_1.default)({ storage: forumStorage });
// --- Forum-API Endpunkte ---
// GET /api/posts
app.get('/api/posts', (_req, res) => {
    const posts = loadPosts();
    res.json(posts);
});
// POST /api/posts  (Felder: title, details, tags, image)
app.post('/api/posts', upload.single('image'), (req, res) => {
    const { title, details, tags } = req.body;
    const imageUrl = req.file ? `/uploads/forum/${req.file.filename}` : null;
    const posts = loadPosts();
    const newPost = {
        id: Date.now(),
        title,
        details,
        tags: tags ? tags.split(',').map((t) => t.trim()) : [],
        imageUrl,
        createdAt: new Date().toISOString()
    };
    posts.unshift(newPost);
    savePosts(posts);
    res.status(201).json(newPost);
});
// Typisierter Root-Handler für Index
const serveIndex = (_req, res) => {
    res.sendFile(path_1.default.join(__dirname, '..', '..', 'frontend', 'html', 'index.html'));
};
app.get('/', serveIndex);
// API-Routen
app.use('/api', routes_1.default);
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});
const PORT = parseInt(process.env.PORT || '3000', 10);
app.listen(PORT, () => {
    console.log(`🚀 Backend läuft auf http://localhost:${PORT}`);
});
