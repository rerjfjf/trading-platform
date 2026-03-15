const express = require('express');
const { Pool } = require('pg');
const { verifyToken, isAdmin, PLAN_LIMITS } = require('../middleware/jwt');

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DB_URL });

// Все пользователи
router.get('/users', verifyToken, isAdmin, async (req, res) => {
  const result = await pool.query(
    `SELECT id, username, email, plan, is_admin, requests_today, created_at FROM users ORDER BY created_at DESC`
  );
  res.json(result.rows);
});

// Изменить план пользователя
router.put('/users/:id/plan', verifyToken, isAdmin, async (req, res) => {
  const { plan } = req.body;
  const { id } = req.params;
  if (!['free', 'pro', 'premium'].includes(plan)) {
    return res.status(400).json({ error: 'Invalid plan' });
  }
  await pool.query(`UPDATE users SET plan = $1 WHERE id = $2`, [plan, id]);
  res.json({ success: true, message: `Plan updated to ${plan}` });
});

// Удалить пользователя
router.delete('/users/:id', verifyToken, isAdmin, async (req, res) => {
  await pool.query(`DELETE FROM users WHERE id = $1`, [req.params.id]);
  res.json({ success: true });
});

// Статистика
router.get('/stats', verifyToken, isAdmin, async (req, res) => {
  const total = await pool.query(`SELECT COUNT(*) FROM users`);
  const byPlan = await pool.query(`SELECT plan, COUNT(*) FROM users GROUP BY plan`);
  res.json({
    total_users: parseInt(total.rows[0].count),
    by_plan: byPlan.rows
  });
});

module.exports = router;