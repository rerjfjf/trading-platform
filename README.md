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
```bash
# Клонировать
git clone https://github.com/rerjfjf/trading-platform.git
cd trading-platform

# Python бэкенд
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn api.main:app --reload

# Auth сервис
cd auth-service
npm install
node index.js

# Фронтенд
cd frontend
npm install
npm start
```

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
POST /ai/chat                     — AI ассистент
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