const jwt = require('jsonwebtoken');

const PLAN_LIMITS = {
  free: {
    requests_per_day: 10,
    strategies: ['rsi'],
    features: ['backtest', 'stock', 'news'],
  },
  pro: {
    requests_per_day: 100,
    strategies: ['rsi', 'ma', 'macd', 'bollinger'],
    features: ['backtest', 'stock', 'monte_carlo', 'lstm', 'portfolio', 'news', 'dividends', 'compare'],
  },
  premium: {
    requests_per_day: 999999,
    strategies: ['rsi', 'ma', 'macd', 'bollinger'],
    features: ['all'],
  }
};

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user?.is_admin) return res.status(403).json({ error: 'Admin only' });
  next();
};

module.exports = { verifyToken, isAdmin, PLAN_LIMITS };