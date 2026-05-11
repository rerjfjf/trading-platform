# 🚀 TRADE_SYS — Algorithmic Trading Research Platform

![Platform](https://img.shields.io/badge/Platform-Trading%20Research-FFD700?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.12-blue?style=for-the-badge&logo=python)
![Rust](https://img.shields.io/badge/Rust-115x%20Faster-orange?style=for-the-badge&logo=rust)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Auth-green?style=for-the-badge&logo=node.js)

> Профессиональная платформа для алгоритмической торговли и финансового анализа.
> Построена с нуля — от математических моделей до полноценного веб-приложения.

---

## ⚡ Стек технологий
```
Backend     → Python 3.12 + FastAPI
Engine      → Rust (PyO3) — 115x быстрее Python
Auth        → Node.js + Express + JWT
Database    → PostgreSQL + SQLAlchemy
Frontend    → React + Framer Motion
AI          → Groq / Llama 3.3
```

---

## 🎯 Возможности

### 📈 Торговые стратегии (Backtesting)
- **RSI** — Relative Strength Index
- **MA Crossover** — пересечение скользящих средних
- **MACD** — Moving Average Convergence Divergence
- **Bollinger Bands** — полосы Боллинджера
- Движок бэктестинга написан на **Rust** — в 115x быстрее Python

### 🧮 Математические модели
- **Блэк-Шоулз** — оценка опционов (Нобелевская премия 1997)
- **Марковиц** — оптимизация портфеля (Monte Carlo, 5000 симуляций)
- **Monte Carlo** — симуляция будущих цен (1000 сценариев)
- **LSTM нейросеть** — прогноз цен через AI (PyTorch)

### 📊 Риск-анализ
- **VaR / CVaR** — Value at Risk (метрика банков)
- **Stress Testing** — кризисы 2000, 2008, COVID, 2022
- **Корреляционная матрица** — диверсификация портфеля
- **Автовыбор стратегии** — платформа сама находит лучшую

### 💼 Портфель трекер
- Реальное отслеживание позиций в реальном времени
- P&L по каждой акции и всему портфелю
- Сохранение портфеля в БД
- Поддержка акций, крипты, ETF

### 🔍 Скринер акций
- Фильтрация по RSI, Sharpe Ratio, волатильности, доходности
- MA сигналы (BULLISH/BEARISH)
- Пресеты: перепроданные, лучший Sharpe, низкий риск
- 48 инструментов включая S&P 500 и крипту

### 📰 Рыночные данные
- Живые котировки через Yahoo Finance
- Последние новости по акции
- История дивидендов
- Сравнение двух акций

### 🤖 AI Ассистент
- Встроенный чат на базе Llama 3.3 (Groq)
- Анализ акций и стратегий
- Объяснение финансовых терминов
- Отвечает на русском и английском

### 🔐 Авторизация и планы
- JWT авторизация (Node.js микросервис)
- 3 плана: FREE / PRO / PREMIUM
- Ограничения по стратегиям и запросам
- Полноценная админ панель

---

## 🚀 Запуск

### 1. Переменные окружения

В корне репозитория есть **`.env.example`**. Скопируйте его в **`.env`** (корень — для Python API), **`auth-service/.env`** (шаблон: `auth-service/.env.example`) и при необходимости **`frontend/.env.local`**.

- **`DATABASE_URL`** — PostgreSQL для таблиц бэктестов, портфелей и т.д. (БД `trading_platform`).
- **`DB_URL`** в auth-service — отдельная БД **`trading_auth`** (создаётся скриптом в Docker, см. ниже).
- **`JWT_SECRET`**: в production не короче 32 символов (сервис не стартует иначе). Для разработки задайте длинную строку вручную.
- **`GROQ_KEY`**: ключ [Groq](https://console.groq.com/) для `/ai/chat`.
- **`ALLOWED_ORIGINS`**: домены фронта через запятую (и в FastAPI, и в auth-service). Для локалки: `http://localhost:3000`.
- **`AUTH_SERVICE_URL`**: базовый URL auth, по умолчанию `http://localhost:3001/auth`.
- **`REACT_APP_API_URL`** / **`REACT_APP_AUTH_URL`**: если фронт не на localhost, укажите URL API и auth.

**Первый администратор** создаётся только если в `auth-service/.env` выставлено `CREATE_DEFAULT_ADMIN=true` и задан **`DEFAULT_ADMIN_PASSWORD`** (не короче 12 символов). Логин: `admin`. После входа смените пароль и отключите `CREATE_DEFAULT_ADMIN`.

### 2. PostgreSQL через Docker

Из корня проекта:

```bash
docker compose up -d
```

Поднимается один контейнер Postgres 16: БД **`trading_platform`** (основная) и **`trading_auth`** (пользователи JWT). Пароль и пользователь по умолчанию заданы в `docker-compose.yml`; для продакшена задайте свои значения через `.env` рядом с compose (переменные `POSTGRES_*`).

Строки подключения для локалки (как в дефолтном compose):

- API: `postgresql://trading:trading_dev_change_me@localhost:5432/trading_platform`
- Auth: `postgresql://trading:trading_dev_change_me@localhost:5432/trading_auth`

Таблица пользователей создаётся при первом запуске **auth-service**. Таблицы Python-приложения:

```bash
source .venv/bin/activate   # после шага 3
python -c "from database.models import init_db; init_db()"
```

### 3. Python API (FastAPI)

Нужен **Python 3.12+** (рекомендуется). Движок бэктеста — модуль **Rust** (соберите через maturin из каталога `rust_engine`, см. документацию PyO3/maturin).

```bash
cd trading-platform
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
# Опционально, только для POST /lstm:
# pip install -r requirements-ml.txt
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

**Лимит AI-чата:** переменная **`AI_CHAT_RATE_LIMIT`** (по умолчанию `30/minute`). Счётчик привязан к пользователю по хэшу JWT, а не только к IP.

### 4. Auth-сервис (Node)

```bash
cd auth-service
npm install
node index.js
```

Порт по умолчанию **3001** (`PORT` в `.env`).

### 5. Фронтенд (React)

```bash
cd frontend
npm install
npm start
```

Откройте приложение (обычно `http://localhost:3000`). Если API или auth на другом хосте — задайте `REACT_APP_API_URL` и `REACT_APP_AUTH_URL` в `frontend/.env.local`.

---

## 📡 API Endpoints
```
GET  /stock/{ticker}              — данные акции
POST /backtest                    — бэктест стратегии (Rust 🦀)
POST /monte-carlo                 — Monte Carlo симуляция
POST /portfolio/optimize          — оптимизация Марковиц
POST /black-scholes               — модель Блэка-Шоулза
POST /lstm                        — LSTM нейросеть
GET  /screener                    — скринер акций
GET  /compare/{ticker1}/{ticker2} — сравнение акций
GET  /dividends/{ticker}          — дивиденды
GET  /news/{ticker}               — новости
GET  /best-strategy/{ticker}      — автовыбор стратегии
GET  /stress-test/{ticker}        — стресс тест
GET  /history                     — история бэктестов
POST /ai/chat                     — AI ассистент (лимит: AI_CHAT_RATE_LIMIT, по умолчанию 30/мин на токен)
```

---

## 🎨 Интерфейс

- OLED чёрная тема с жёлтыми акцентами
- Анимации через Framer Motion
- ASCII арт и терминальная эстетика
- Поддержка EN / RU

---

## 📁 Структура проекта
```
trading-platform/
├── api/              — FastAPI бэкенд
├── docker/           — init-скрипты PostgreSQL для Docker
├── docker-compose.yml — локальный Postgres (trading_platform + trading_auth)
├── strategies/       — торговые стратегии
├── models/           — математические модели
├── backtest/         — движок бэктестинга
├── database/         — PostgreSQL модели и CRUD
├── rust_engine/      — Rust движок (PyO3)
├── auth-service/     — Node.js авторизация
└── frontend/         — React приложение
```

---

*Построено с нуля в 15 лет. Без единой вложенной копейки. 😎*

тест для CodeX