import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
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

export async function register(
  req: Request<{}, {}, RegisterBody>,
  res: Response
) {
  const { username, password, role } = req.body;
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
    return res.status(201).json({ message: 'User registered', userId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Registration failed' });
  }
}

export async function login(
  req: Request<{}, {}, LoginBody>,
  res: Response
) {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.query<any[]>(
      `SELECT id, role, password_hash
         FROM users
        WHERE username = ?`,
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '2h' }
    );
    return res.json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Login failed' });
  }
}
