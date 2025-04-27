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
app.use('/js/client', express_1.default.static(path_1.default.join(__dirname, '../../../../js/client')));
app.use('/styles', express_1.default.static(path_1.default.join(__dirname, '../../../frontend/styles')));
app.use('/assets/images', express_1.default.static(path_1.default.join(__dirname, '../../../frontend/assets/images')));
app.use(express_1.default.static(path_1.default.join(__dirname, '../../../frontend/html')));
app.get('/', (_req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../../../frontend/html/index.html'));
});
app.use('/api', routes_1.default);
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});
const PORT = parseInt(process.env.PORT || '3000', 10);
app.listen(PORT, () => {
    console.log(`🚀 Backend läuft auf http://localhost:${PORT}`);
});
