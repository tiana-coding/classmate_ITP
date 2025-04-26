"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Registration handler
const register = async (req, res) => {
    const { username, password, role } = req.body;
    console.log('Register-Request:', req.body);
    try {
        const hash = await bcrypt_1.default.hash(password, 12);
        const conn = await db_1.pool.getConnection();
        await conn.beginTransaction();
        // neuen User anlegen
        const [result] = await conn.query(`INSERT INTO users (username, role, password_hash, created_at)
         VALUES (?, ?, ?, NOW())`, [username, role, hash]);
        const userId = result.insertId;
        // initiale Punktezeile anlegen
        await conn.query(`INSERT INTO points (user_id, total_points, created_at)
         VALUES (?, 0, NOW())`, [userId]);
        await conn.commit();
        conn.release();
        console.log('User registered, ID=', userId);
        res.status(201).json({ message: 'User registered', userId });
    }
    catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ error: 'Registration failed' });
    }
};
exports.register = register;
// Login handler
const login = async (req, res) => {
    const { username, password } = req.body;
    console.log('Login-Request:', req.body);
    try {
        const [rows] = await db_1.pool.query(`SELECT id, role, password_hash FROM users WHERE username = ?`, [username]);
        if (rows.length === 0) {
            console.warn('Login failed: User not found');
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const user = rows[0];
        const ok = await bcrypt_1.default.compare(password, user.password_hash);
        if (!ok) {
            console.warn('Login failed: Wrong password');
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
        console.log('Login successful, token issued');
        res.json({ token });
    }
    catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
};
exports.login = login;
