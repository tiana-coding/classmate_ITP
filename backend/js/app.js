"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/ts/app.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// ---- Middleware ----
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// 1) Client-JS (Signup/Login)
app.use('/js/client/modules/auth', express_1.default.static(path_1.default.join(__dirname, '..', '..', 'js', 'client', 'modules', 'auth')));
// 2) Front-end JS-Module & Utils
app.use('/js', express_1.default.static(path_1.default.join(__dirname, '..', '..', 'frontend', 'js')));
// 3) Stylesheets
app.use('/styles', express_1.default.static(path_1.default.join(__dirname, '..', '..', 'frontend', 'styles')));
// 4) Komponenten (Header, Navbar…)
app.use('/components', express_1.default.static(path_1.default.join(__dirname, '..', '..', 'frontend', 'components')));
// 5) Bilder
app.use('/assets/images', express_1.default.static(path_1.default.join(__dirname, '..', '..', 'frontend', 'assets', 'images')));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '..', '..', 'frontend', 'assets', 'images', 'uploads')));
// 6) HTML-Seiten
app.use(express_1.default.static(path_1.default.join(__dirname, '..', '..', 'frontend', 'html')));
// ---- Forum (Posts) ----
const POSTS_FILE = path_1.default.resolve(__dirname, '..', 'data', 'posts.json');
function loadPosts() {
    try {
        return JSON.parse(fs_1.default.readFileSync(POSTS_FILE, 'utf-8'));
    }
    catch {
        return [];
    }
}
function savePosts(posts) {
    fs_1.default.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf-8');
}
// Bild-Upload für Forum
const forumStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, path_1.default.join(__dirname, '..', '..', 'frontend', 'assets', 'images', 'uploads', 'forum'));
    },
    filename: (_req, file, cb) => {
        const name = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
        cb(null, name);
    }
});
const upload = (0, multer_1.default)({ storage: forumStorage });
app.get('/api/posts', (_req, res) => {
    res.json(loadPosts());
});
app.post('/api/posts', upload.single('image'), (req, res) => {
    const { title, details, tags } = req.body;
    const posts = loadPosts();
    const newPost = {
        id: Date.now(),
        title,
        details,
        tags: typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : [],
        imageUrl: req.file ? `/uploads/forum/${req.file.filename}` : null,
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: []
    };
    posts.unshift(newPost);
    savePosts(posts);
    res.status(201).json(newPost);
});
// ==== Feedback-Pfad und -Helper ====
const FEEDBACK_FILE = path_1.default.resolve(__dirname, '..', 'data', 'feedback.json');
function loadFeedback() {
    try {
        return JSON.parse(fs_1.default.readFileSync(FEEDBACK_FILE, 'utf-8'));
    }
    catch {
        return [];
    }
}
function saveFeedback(entries) {
    fs_1.default.writeFileSync(FEEDBACK_FILE, JSON.stringify(entries, null, 2));
}
app.post('/api/feedback', (req, res) => {
    const { rating, feedbackText } = req.body;
    if (!rating || !feedbackText) {
        res.status(400).json({ error: 'Bewertung und Text erforderlich' });
        return;
    }
    // Speichern in feedback.json
    const filePath = path_1.default.join(__dirname, '..', 'data', 'feedback.json');
    const feedbackList = fs_1.default.existsSync(filePath)
        ? JSON.parse(fs_1.default.readFileSync(filePath, 'utf-8'))
        : [];
    feedbackList.push({
        rating,
        feedbackText,
        createdAt: new Date().toISOString(),
    });
    fs_1.default.writeFileSync(filePath, JSON.stringify(feedbackList, null, 2));
    res.status(201).json({ message: 'Feedback gespeichert' });
});
// --- Dummy-Gamification-Route für Frontend-Tests ---
app.get('/api/gamification/stats', (_req, res) => {
    res.json({
        points: 450,
        level: 5
    });
});
// --- Leaderboard ----
app.get('/api/gamification/leaderboard', (_req, res) => {
    const filePath = path_1.default.join(__dirname, '..', 'data', 'userStats.json');
    fs_1.default.readFile(filePath, 'utf-8', (err, rawData) => {
        if (err) {
            console.error('Fehler beim Lesen der Rangliste:', err);
            return res.status(500).json({ error: 'Interner Serverfehler' });
        }
        try {
            const data = JSON.parse(rawData); // rawData ist vom Typ string
            res.json(data);
        }
        catch (parseError) {
            console.error('Fehler beim Parsen der Rangliste:', parseError);
            res.status(500).json({ error: 'Fehler beim Parsen der Rangliste' });
        }
    });
});
// ==== Healthcheck & Start ====
app.use('/api', routes_1.default);
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});
const PORT = parseInt(process.env.PORT || '3000', 10);
app.listen(PORT, () => {
    console.log(`🚀 Backend läuft auf http://localhost:${PORT}`);
});
