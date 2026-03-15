import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navbar
      "nav.dashboard": "DASHBOARD",
      "nav.research": "RESEARCH", 
      "nav.market": "MARKET",
      "nav.models": "MODELS",
      "nav.history": "HISTORY",
      "nav.market_open": "NYSE OPEN",
      "nav.market_closed": "NYSE CLOSED",

      // Hero
      "hero.boot": "// SYSTEM BOOT",
      "hero.capabilities": "// CAPABILITIES",
      "hero.strategies": "STRATEGIES",
      "hero.rust_speed": "RUST SPEED",
      "hero.models": "MODELS",
      "hero.endpoints": "ENDPOINTS",

      // Typing lines
      "boot.line1": "> Initializing trading systems...",
      "boot.line2": "> Loading market data...",
      "boot.line3": "> Connecting to NYSE, NASDAQ...",
      "boot.line4": "> Mathematical models ready.",
      "boot.line5": "> Rust engine: 115x faster.",
      "boot.line6": "> System ready. Welcome, trader.",

      // Dashboard
      "dashboard.title": "BACKTESTING DASHBOARD",
      "dashboard.subtitle": "STRATEGY ANALYSIS",
      "dashboard.ticker": "TICKER",
      "dashboard.strategy": "STRATEGY",
      "dashboard.run": "▶ RUN BACKTEST",
      "dashboard.loading": "LOADING...",
      "dashboard.monte_carlo": "◈ MONTE CARLO",
      "dashboard.lstm": "◈ LSTM AI",

      // Cards
      "card.ticker": "TICKER",
      "card.return": "TOTAL RETURN",
      "card.capital": "FINAL CAPITAL",
      "card.sharpe": "SHARPE RATIO",
      "card.drawdown": "MAX DRAWDOWN",
      "card.trades": "TOTAL TRADES",
      "card.price": "CURRENT PRICE",
      "card.1y_return": "1Y RETURN",

      // Strategy info
      "strategy.engine": "// STRATEGY INFO — ENGINE: RUST 🦀",
      "strategy.rsi": "RSI: Buy when RSI < 30 (oversold), sell when RSI > 70 (overbought)",
      "strategy.ma": "MA Crossover: Buy when MA20 crosses MA50 upward, sell on reverse",
      "strategy.macd": "MACD: Buy when MACD crosses Signal line upward, sell on reverse",
      "strategy.bollinger": "Bollinger Bands: Buy at lower band touch, sell at upper band touch",

      // Monte Carlo
      "mc.title": "// MONTE CARLO SIMULATION",
      "mc.current": "CURRENT PRICE",
      "mc.median": "MEDIAN 50%",
      "mc.prob": "PROFIT PROBABILITY",
      "mc.worst": "WORST CASE 5%",
      "mc.best": "BEST CASE 95%",
      "mc.period": "PERIOD",
      "mc.forecast": "PRICE RANGE FORECAST",
      "mc.days": "days",

      // LSTM
      "lstm.title": "// LSTM NEURAL NETWORK FORECAST",
      "lstm.current": "CURRENT PRICE",
      "lstm.forecast": "30D FORECAST",
      "lstm.change": "EXPECTED CHANGE",
      "lstm.chart": "30-DAY PRICE FORECAST",

      // Portfolio
      "portfolio.title": "PORTFOLIO OPTIMIZATION",
      "portfolio.subtitle": "MARKOWITZ MODEL",
      "portfolio.tickers": "TICKERS (comma separated)",
      "portfolio.optimize": "◈ OPTIMIZE",
      "portfolio.return": "EXPECTED RETURN",
      "portfolio.risk": "RISK",
      "portfolio.sharpe": "SHARPE RATIO",

      // Market
      "market.title": "MARKET FEED",
      "market.subtitle": "LIVE NEWS",

      // History
      "history.title": "BACKTEST HISTORY",
      "history.subtitle": "DATABASE",
      "history.empty": "No backtest history yet. Run a backtest to see results here.",
      "history.ticker": "TICKER",
      "history.strategy": "STRATEGY",
      "history.return": "RETURN",
      "history.sharpe": "SHARPE",
      "history.drawdown": "DRAWDOWN",
      "history.trades": "TRADES",
      "history.date": "DATE",

      "feat.backtest": "4 strategies powered by Rust 🦀",
      "feat.monte_carlo": "1000 future simulations",
      "feat.lstm": "AI price prediction",
      "feat.black_scholes": "Nobel Prize options formula",
      "feat.markowitz": "Portfolio optimization",
      "feat.stress": "Crises 2000-2022",
      "feat.var": "Bank risk metrics",
      "feat.correlation": "Portfolio diversification",


      // Errors
      "error.server": "Server error. Make sure the server is running.",
    }
  },
  ru: {
    translation: {
      // Navbar
      "nav.dashboard": "ДАШБОРД",
      "nav.research": "АНАЛИЗ",
      "nav.market": "РЫНОК",
      "nav.models": "МОДЕЛИ",
      "nav.history": "ИСТОРИЯ",
      "nav.market_open": "NYSE ОТКРЫТ",
      "nav.market_closed": "NYSE ЗАКРЫТ",

      // Hero
      "hero.boot": "// ЗАГРУЗКА СИСТЕМЫ",
      "hero.capabilities": "// ВОЗМОЖНОСТИ",
      "hero.strategies": "СТРАТЕГИЙ",
      "hero.rust_speed": "СКОРОСТЬ RUST",
      "hero.models": "МОДЕЛЕЙ",
      "hero.endpoints": "ЭНДПОИНТОВ",

      // Typing lines
      "boot.line1": "> Инициализация торговых систем...",
      "boot.line2": "> Загрузка рыночных данных...",
      "boot.line3": "> Подключение к NYSE, NASDAQ...",
      "boot.line4": "> Математические модели готовы.",
      "boot.line5": "> Rust движок: в 115x быстрее.",
      "boot.line6": "> Система готова. Добро пожаловать, трейдер.",

      // Dashboard
      "dashboard.title": "ДАШБОРД БЭКТЕСТИНГА",
      "dashboard.subtitle": "АНАЛИЗ СТРАТЕГИЙ",
      "dashboard.ticker": "ТИКЕР",
      "dashboard.strategy": "СТРАТЕГИЯ",
      "dashboard.run": "▶ ЗАПУСТИТЬ",
      "dashboard.loading": "ЗАГРУЗКА...",
      "dashboard.monte_carlo": "◈ МОНТЕ КАРЛО",
      "dashboard.lstm": "◈ LSTM AI",

      // Cards
      "card.ticker": "ТИКЕР",
      "card.return": "ДОХОДНОСТЬ",
      "card.capital": "ИТОГОВЫЙ КАПИТАЛ",
      "card.sharpe": "SHARPE RATIO",
      "card.drawdown": "МАКС. ПРОСАДКА",
      "card.trades": "СДЕЛОК",
      "card.price": "ТЕКУЩАЯ ЦЕНА",
      "card.1y_return": "ДОХОДНОСТЬ ЗА ГОД",

      // Strategy info
      "strategy.engine": "// СТРАТЕГИЯ — ДВИЖОК: RUST 🦀",
      "strategy.rsi": "RSI: Покупает когда RSI < 30, продаёт когда RSI > 70",
      "strategy.ma": "MA Crossover: Покупает при пересечении MA20 и MA50 снизу вверх",
      "strategy.macd": "MACD: Покупает при пересечении MACD и Signal линии снизу вверх",
      "strategy.bollinger": "Bollinger Bands: Покупает при касании нижней полосы, продаёт верхней",

      // Monte Carlo
      "mc.title": "// СИМУЛЯЦИЯ МОНТЕ КАРЛО",
      "mc.current": "ТЕКУЩАЯ ЦЕНА",
      "mc.median": "МЕДИАНА 50%",
      "mc.prob": "ВЕРОЯТНОСТЬ ПРИБЫЛИ",
      "mc.worst": "ХУДШИЙ СЦЕНАРИЙ 5%",
      "mc.best": "ЛУЧШИЙ СЦЕНАРИЙ 95%",
      "mc.period": "ПЕРИОД",
      "mc.forecast": "ПРОГНОЗ ДИАПАЗОНА ЦЕН",
      "mc.days": "дней",

      // LSTM
      "lstm.title": "// ПРОГНОЗ НЕЙРОСЕТИ LSTM",
      "lstm.current": "ТЕКУЩАЯ ЦЕНА",
      "lstm.forecast": "ПРОГНОЗ НА 30Д",
      "lstm.change": "ОЖИДАЕМОЕ ИЗМЕНЕНИЕ",
      "lstm.chart": "ПРОГНОЗ ЦЕН НА 30 ДНЕЙ",

      // Portfolio
      "portfolio.title": "ОПТИМИЗАЦИЯ ПОРТФЕЛЯ",
      "portfolio.subtitle": "МОДЕЛЬ МАРКОВИЦА",
      "portfolio.tickers": "ТИКЕРЫ (через запятую)",
      "portfolio.optimize": "◈ ОПТИМИЗИРОВАТЬ",
      "portfolio.return": "ОЖИДАЕМАЯ ДОХОДНОСТЬ",
      "portfolio.risk": "РИСК",
      "portfolio.sharpe": "SHARPE RATIO",

      // Market
      "market.title": "РЫНОЧНАЯ ЛЕНТА",
      "market.subtitle": "ЖИВЫЕ НОВОСТИ",

      // History
      "history.title": "ИСТОРИЯ БЭКТЕСТОВ",
      "history.subtitle": "БАЗА ДАННЫХ",
      "history.empty": "История пуста. Запустите бэктест чтобы увидеть результаты.",
      "history.ticker": "ТИКЕР",
      "history.strategy": "СТРАТЕГИЯ",
      "history.return": "ДОХОДНОСТЬ",
      "history.sharpe": "SHARPE",
      "history.drawdown": "ПРОСАДКА",
      "history.trades": "СДЕЛОК",
      "history.date": "ДАТА",

      "feat.backtest": "4 стратегии на Rust 🦀",
      "feat.monte_carlo": "1000 симуляций будущего",
      "feat.lstm": "Предсказание цен через AI",
      "feat.black_scholes": "Нобелевская формула опционов",
      "feat.markowitz": "Оптимизация портфеля",
      "feat.stress": "Кризисы 2000-2022",
      "feat.var": "Риск-метрики банков",
      "feat.correlation": "Диверсификация портфеля",




      // Errors
      "error.server": "Ошибка сервера. Убедись что сервер запущен.",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ru',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;