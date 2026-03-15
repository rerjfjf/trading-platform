const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { verifyToken, PLAN_LIMITS } = require('../middleware/jwt');

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DB_URL });

// Создаём таблицу если нет
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    plan VARCHAR(20) DEFAULT 'free',
    is_admin BOOLEAN DEFAULT false,
    requests_today INTEGER DEFAULT 0,
    last_request_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW()
  )
`).then(() => {
  // Создаём админа если нет
  return pool.query(`SELECT * FROM users WHERE username = 'admin'`);
}).then(async (result) => {
  if (result.rows.length === 0) {
    const hash = await bcrypt.hash('admin123', 10);
    await pool.query(
      `INSERT INTO users (username, email, password_hash, plan, is_admin) VALUES ($1, $2, $3, $4, $5)`,
      ['admin', 'admin@trading.com', hash, 'premium', true]
    );
    console.log('Admin created: admin / admin123 ✅');
  }
}).catch(console.error);

// Регистрация
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, plan`,
      [username, email, hash]
    );
    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, username: user.username, plan: user.plan, is_admin: false },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, plan: user.plan } });
  } catch (e) {
    if (e.code === '23505') return res.status(400).json({ error: 'Username or email already exists' });
    res.status(500).json({ error: e.message });
  }
});

// Логин
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(`SELECT * FROM users WHERE username = $1`, [username]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, username: user.username, plan: user.plan, is_admin: user.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email, plan: user.plan, is_admin: user.is_admin }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Получить текущего пользователя
router.get('/me', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, email, plan, is_admin, requests_today, created_at FROM users WHERE id = $1`,
      [req.user.id]
    );
    const user = result.rows[0];
    const limits = PLAN_LIMITS[user.plan];
    res.json({ ...user, limits });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Проверить токен (для FastAPI)
router.post('/verify', async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const limits = PLAN_LIMITS[decoded.plan];
    res.json({ valid: true, user: decoded, limits });
  } catch (e) {
    res.json({ valid: false });
  }
});

module.exports = router;