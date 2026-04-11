const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const isProd = process.env.NODE_ENV === 'production';
const jwtSecret = process.env.JWT_SECRET || '';

if (isProd) {
  if (!jwtSecret || jwtSecret.length < 32) {
    console.error(
      'FATAL: в production нужен JWT_SECRET длиной не менее 32 символов.'
    );
    process.exit(1);
  }
} else if (!jwtSecret) {
  console.warn(
    'Предупреждение: JWT_SECRET не задан. Задайте его в .env до выкладки в сеть.'
  );
}

const allowedOriginsRaw = process.env.ALLOWED_ORIGINS;
const corsOrigin =
  allowedOriginsRaw && allowedOriginsRaw.trim()
    ? allowedOriginsRaw.split(',').map((s) => s.trim())
    : true;

const app = express();
app.set('trust proxy', 1);
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: '100kb' }));

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Auth Service running 🔐', version: '1.0.0' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});
