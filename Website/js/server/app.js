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
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// 1) Statische HTML-Dateien
app.use(express_1.default.static(path_1.default.join(__dirname, '../../frontend/html')));
// 2) Kompilierte JS für Client
app.use('/js/client', express_1.default.static(path_1.default.join(__dirname, '../../js/client')));
// 3) Stylesheet
app.use('/styles', express_1.default.static(path_1.default.join(__dirname, '../../frontend/styles')));
// 4) Bilder
app.use('/assets/images', express_1.default.static(path_1.default.join(__dirname, '../../frontend/assets/images')));
// 5) API-Routen
app.use('/api', routes_1.default);
// Health-Check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});
const PORT = parseInt(process.env.PORT || '3000', 10);
app.listen(PORT, () => {
    console.log(`🚀 Backend läuft auf http://localhost:${PORT}`);
});
