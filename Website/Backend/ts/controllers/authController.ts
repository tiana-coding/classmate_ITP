import { RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';
import { pool } from '../db';
import dotenv from 'dotenv';

dotenv.config();

interface RegisterBody {
  username: string;
  password: string;
  role:     string;
}
interface LoginBody {
  username: string;
  password: string;
}

// Registration handler
export const register: RequestHandler<{}, any, RegisterBody> =
  async (req, res) => {
    const { username, password, role } = req.body;
    console.log('Register-Request:', req.body);
    try {
      const hash = await bcrypt.hash(password, 12);
      const conn = await pool.getConnection();
      await conn.beginTransaction();

      // neuen User anlegen
      const [result] = await conn.query<mysql.ResultSetHeader>(
        `INSERT INTO users (username, role, password_hash, created_at)
         VALUES (?, ?, ?, NOW())`,
        [username, role, hash]
      );
      const userId = result.insertId;

      // initiale Punktezeile anlegen
      await conn.query(
        `INSERT INTO points (user_id, total_points, created_at)
         VALUES (?, 0, NOW())`,
        [userId]
      );

      await conn.commit();
      conn.release();
      console.log('User registered, ID=', userId);
      res.status(201).json({ message: 'User registered', userId });
    } catch (err) {
      console.error('Registration Error:', err);
      res.status(500).json({ error: 'Registration failed' });
    }
  };

// Login handler
export const login: RequestHandler<{}, any, LoginBody> =
  async (req, res) => {
    const { username, password } = req.body;
    console.log('Login-Request:', req.body);
    try {
      const [rows] = await pool.query<any[]>(
        `SELECT id, role, password_hash FROM users WHERE username = ?`,
        [username]
      );

      if (rows.length === 0) {
        console.warn('Login failed: User not found');
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const user = rows[0];
      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) {
        console.warn('Login failed: Wrong password');
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: '2h' }
      );
      console.log('Login successful, token issued');
      res.json({ token });
    } catch (err) {
      console.error('Login Error:', err);
      res.status(500).json({ error: 'Login failed' });
    }
  };
