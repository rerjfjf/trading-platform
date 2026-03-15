import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import { theme } from "./styles/theme";
import AuthModal from "./components/AuthModal";

const API = "http://127.0.0.1:8000";

// Компонент карточки



const Card = ({ label, value, color }) => (
  <motion.div
    whileHover={{ scale: 1.02, borderColor: theme.colors.yellow }}
    style={{
      background: theme.colors.bgCard,
      borderRadius: 8,
      padding: "20px",
      border: `1px solid ${theme.colors.border}`,
      transition: "all 0.2s",
    }}
  >
    <div style={{ color: theme.colors.textSecondary, fontFamily: theme.fonts.mono, fontSize: 10, letterSpacing: 2, marginBottom: 8 }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: "bold", color: color || theme.colors.text, fontFamily: theme.fonts.mono }}>{value}</div>
  </motion.div>
);

// Секция заголовок
const SectionHeader = ({ id, title, subtitle }) => (
  <div id={id} style={{ marginBottom: 32, paddingTop: 80 }}>
    <div style={{ color: theme.colors.yellow, fontFamily: theme.fonts.mono, fontSize: 11, letterSpacing: 3, marginBottom: 8 }}>
      // {subtitle}
    </div>
    <div style={{ color: theme.colors.text, fontFamily: theme.fonts.mono, fontSize: 24, fontWeight: "bold", letterSpacing: 2 }}>
      {title}
    </div>
    <div style={{ width: 60, height: 2, background: theme.colors.yellow, marginTop: 12, boxShadow: theme.glow.yellow }} />
  </div>
);

export default function App() {
  const [user, setUser] = useState(() => {
  const saved = localStorage.getItem("user");
  return saved ? JSON.parse(saved) : null;
});
const [authOpen, setAuthOpen] = useState(false);

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  setUser(null);
};
  const [ticker, setTicker] = useState("AAPL");
  const [strategy, setStrategy] = useState("rsi");
  const [result, setResult] = useState(null);
  const [stock, setStock] = useState(null);
  const [mc, setMc] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [portfolioTickers, setPortfolioTickers] = useState("AAPL,GOOGL,MSFT,TSLA,AMZN");
  const [lstm, setLstm] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("DASHBOARD");

  // Загружаем новости при старте
  useEffect(() => {
    axios.get(`${API}/news/AAPL`).then(r => setNews(r.data.news)).catch(() => {});
  }, []);

  const runBacktest = async () => {
    setLoading(true);
    try {
      const [b, s] = await Promise.all([
        axios.post(`${API}/backtest`, { ticker, period: "2y", strategy }),
        axios.get(`${API}/stock/${ticker}`)
      ]);
      setResult(b.data);
      setStock(s.data);
    } catch (e) { alert("Ошибка сервера"); }
    setLoading(false);
  };

  const runMonteCarlo = async () => {
    setLoading(true);
    try {
      const r = await axios.post(`${API}/monte-carlo`, { ticker, days: 126, simulations: 1000 });
      setMc(r.data);
    } catch (e) { alert("Ошибка сервера"); }
    setLoading(false);
  };

  const runPortfolio = async () => {
    setLoading(true);
    try {
      const tickers = portfolioTickers.split(",").map(t => t.trim().toUpperCase());
      const r = await axios.post(`${API}/portfolio/optimize`, { tickers, period: "2y", simulations: 3000 });
      setPortfolio(r.data);
    } catch (e) { alert("Ошибка сервера"); }
    setLoading(false);
  };

  const runLstm = async () => {
    setLoading(true);
    try {
      const r = await axios.post(`${API}/lstm`, { ticker, period: "5y", epochs: 50, predict_days: 30 });
      setLstm(r.data);
    } catch (e) { alert("Ошибка сервера"); }
    setLoading(false);
  };

  const inputStyle = {
    background: theme.colors.bgCard,
    border: `1px solid ${theme.colors.border}`,
    color: theme.colors.text,
    padding: "10px 16px",
    borderRadius: 6,
    fontSize: 13,
    fontFamily: theme.fonts.mono,
    outline: "none",
  };

  const btnStyle = (color = theme.colors.yellow) => ({
    background: "transparent",
    border: `1px solid ${color}`,
    color: color,
    padding: "10px 24px",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: "bold",
    cursor: "pointer",
    fontFamily: theme.fonts.mono,
    letterSpacing: 2,
    transition: "all 0.2s",
  });

  const returnColor = (val) => val >= 0 ? theme.colors.green : theme.colors.red;

  return (
    <div style={{ background: theme.colors.bg, minHeight: "100vh", color: theme.colors.text }}>
      <Navbar
        activeSection={activeSection}
        user={user}
        onLoginClick={() => setAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Hero */}
      <HeroSection />

      {/* Основной контент */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 32px 80px" }}>

        {/* DASHBOARD */}
        <SectionHeader id="dashboard" title="BACKTESTING DASHBOARD" subtitle="STRATEGY ANALYSIS" />

        {/* Контролы */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          style={{
            display: "flex", gap: 12, marginBottom: 32,
            background: theme.colors.bgCard,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: 8, padding: 20,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ color: theme.colors.textSecondary, fontFamily: theme.fonts.mono, fontSize: 10, letterSpacing: 2 }}>TICKER</label>
            <input
              value={ticker}
              onChange={e => setTicker(e.target.value.toUpperCase())}
              style={{ ...inputStyle, width: 120 }}
              placeholder="AAPL"
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ color: theme.colors.textSecondary, fontFamily: theme.fonts.mono, fontSize: 10, letterSpacing: 2 }}>STRATEGY</label>
            <select value={strategy} onChange={e => setStrategy(e.target.value)} style={{ ...inputStyle, width: 180 }}>
              <option value="rsi">RSI Strategy</option>
              <option value="ma">MA Crossover</option>
              <option value="macd">MACD</option>
              <option value="bollinger">Bollinger Bands</option>
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <motion.button
              whileHover={{ background: theme.colors.yellowGlow, boxShadow: theme.glow.yellow }}
              whileTap={{ scale: 0.95 }}
              onClick={runBacktest}
              disabled={loading}
              style={btnStyle()}
            >
              {loading ? "LOADING..." : "▶ RUN BACKTEST"}
            </motion.button>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <motion.button
              whileHover={{ background: "rgba(0,255,136,0.1)", boxShadow: theme.glow.green }}
              whileTap={{ scale: 0.95 }}
              onClick={runMonteCarlo}
              disabled={loading}
              style={btnStyle(theme.colors.green)}
            >
              ◈ MONTE CARLO
            </motion.button>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <motion.button
              whileHover={{ background: "rgba(0,255,136,0.1)", boxShadow: theme.glow.green }}
              whileTap={{ scale: 0.95 }}
              onClick={runLstm}
              disabled={loading}
              style={btnStyle(theme.colors.green)}
            >
              ◈ LSTM AI
            </motion.button>
          </div>
        </motion.div>

        {/* Результаты бэктеста */}
        {result && stock && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
              <Card label="TICKER" value={result.ticker} color={theme.colors.yellow} />
              <Card label="TOTAL RETURN" value={`${result.total_return}%`} color={returnColor(result.total_return)} />
              <Card label="FINAL CAPITAL" value={`$${result.final_capital.toLocaleString()}`} color={returnColor(result.total_return)} />
              <Card label="SHARPE RATIO" value={result.sharpe_ratio} color={theme.colors.yellow} />
              <Card label="MAX DRAWDOWN" value={`${result.max_drawdown}%`} color={theme.colors.red} />
              <Card label="TOTAL TRADES" value={result.total_trades} />
              <Card label="CURRENT PRICE" value={`$${stock.latest_price}`} color={theme.colors.yellow} />
              <Card label="1Y RETURN" value={`${stock.change_1y}%`} color={returnColor(stock.change_1y)} />
            </div>

            {/* Инфо о стратегии */}
            <motion.div
              whileHover={{ borderColor: theme.colors.yellow }}
              style={{
                background: theme.colors.bgCard,
                borderRadius: 8,
                padding: 24,
                border: `1px solid ${theme.colors.border}`,
                marginBottom: 32,
                transition: "all 0.2s",
              }}
            >
              <div style={{ color: theme.colors.yellow, fontFamily: theme.fonts.mono, fontSize: 11, letterSpacing: 2, marginBottom: 8 }}>
                // STRATEGY INFO — ENGINE: RUST 🦀
              </div>
              <div style={{ fontFamily: theme.fonts.mono, fontSize: 13, color: theme.colors.textSecondary }}>
                {result.strategy === "rsi" && "RSI: Buy when RSI < 30 (oversold), sell when RSI > 70 (overbought)"}
                {result.strategy === "ma" && "MA Crossover: Buy when MA20 crosses MA50 upward, sell on reverse"}
                {result.strategy === "macd" && "MACD: Buy when MACD crosses Signal line upward, sell on reverse"}
                {result.strategy === "bollinger" && "Bollinger Bands: Buy at lower band touch, sell at upper band touch"}
              </div>
              <div style={{ marginTop: 16, padding: 12, background: theme.colors.bg, borderRadius: 6, fontFamily: theme.fonts.mono, fontSize: 12 }}>
                <span style={{ color: theme.colors.textSecondary }}>Initial: </span>
                <span style={{ color: theme.colors.text }}>${result.initial_capital.toLocaleString()}</span>
                <span style={{ color: theme.colors.textSecondary, marginLeft: 24 }}>Final: </span>
                <span style={{ color: returnColor(result.total_return) }}>${result.final_capital.toLocaleString()}</span>
                <span style={{ color: theme.colors.textSecondary, marginLeft: 24 }}>P&L: </span>
                <span style={{ color: returnColor(result.total_return) }}>
                  ${(result.final_capital - result.initial_capital).toFixed(2)}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Monte Carlo результаты */}
        {mc && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
            <div style={{ color: theme.colors.green, fontFamily: theme.fonts.mono, fontSize: 11, letterSpacing: 2, marginBottom: 16 }}>
              // MONTE CARLO SIMULATION — {mc.ticker}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
              <Card label="CURRENT PRICE" value={`$${mc.last_price}`} color={theme.colors.yellow} />
              <Card label="MEDIAN 50%" value={`$${mc.percentile_50}`} color={theme.colors.green} />
              <Card label="PROFIT PROBABILITY" value={`${mc.prob_profit}%`} color={mc.prob_profit >= 50 ? theme.colors.green : theme.colors.red} />
              <Card label="WORST CASE 5%" value={`$${mc.percentile_5}`} color={theme.colors.red} />
              <Card label="BEST CASE 95%" value={`$${mc.percentile_95}`} color={theme.colors.green} />
              <Card label="PERIOD" value={`${mc.days} days`} color={theme.colors.yellow} />
            </div>
            {/* Визуализация диапазона */}
            <motion.div
              style={{
                background: theme.colors.bgCard,
                borderRadius: 8,
                padding: 24,
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              <div style={{ color: theme.colors.green, fontFamily: theme.fonts.mono, fontSize: 11, letterSpacing: 2, marginBottom: 16 }}>
                PRICE RANGE FORECAST
              </div>
              <div style={{ height: 8, background: theme.colors.bg, borderRadius: 4, overflow: "hidden", position: "relative" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1 }}
                  style={{
                    height: "100%",
                    background: `linear-gradient(90deg, ${theme.colors.red}, ${theme.colors.yellow}, ${theme.colors.green})`,
                    borderRadius: 4,
                  }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: theme.fonts.mono, fontSize: 11 }}>
                <span style={{ color: theme.colors.red }}>${mc.percentile_5} (5%)</span>
                <span style={{ color: theme.colors.yellow }}>${mc.percentile_25} (25%)</span>
                <span style={{ color: theme.colors.text }}>${mc.percentile_50} (50%)</span>
                <span style={{ color: theme.colors.yellow }}>${mc.percentile_75} (75%)</span>
                <span style={{ color: theme.colors.green }}>${mc.percentile_95} (95%)</span>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* LSTM результаты */}
        {lstm && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
            <div style={{ color: theme.colors.green, fontFamily: theme.fonts.mono, fontSize: 11, letterSpacing: 2, marginBottom: 16 }}>
              // LSTM NEURAL NETWORK FORECAST — {lstm.ticker}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
              <Card label="CURRENT PRICE" value={`$${lstm.last_price}`} color={theme.colors.yellow} />
              <Card label="30D FORECAST" value={`$${lstm.predicted_price_30d}`} color={returnColor(lstm.change_30d)} />
              <Card label="EXPECTED CHANGE" value={`${lstm.change_30d}%`} color={returnColor(lstm.change_30d)} />
            </div>
            {/* Барчарт прогноза */}
            <motion.div
              style={{
                background: theme.colors.bgCard,
                borderRadius: 8,
                padding: 24,
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              <div style={{ color: theme.colors.green, fontFamily: theme.fonts.mono, fontSize: 11, letterSpacing: 2, marginBottom: 16 }}>
                30-DAY PRICE FORECAST
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 100 }}>
                {lstm.future_prices.map((price, i) => {
                  const min = Math.min(...lstm.future_prices);
                  const max = Math.max(...lstm.future_prices);
                  const h = ((price - min) / (max - min)) * 85 + 15;
                  const c = price >= lstm.last_price ? theme.colors.green : theme.colors.red;
                  return (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.02, duration: 0.3 }}
                      style={{ flex: 1, background: c, opacity: 0.7, borderRadius: "2px 2px 0 0" }}
                      title={`Day ${i + 1}: $${price}`}
                    />
                  );
                })}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: theme.fonts.mono, fontSize: 10, color: theme.colors.textSecondary }}>
                <span>Day 1</span>
                <span>Day 15</span>
                <span>Day 30</span>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* PORTFOLIO */}
        <SectionHeader id="models" title="PORTFOLIO OPTIMIZATION" subtitle="MARKOWITZ MODEL" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          style={{
            background: theme.colors.bgCard,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: 8,
            padding: 24,
            marginBottom: 32,
          }}
        >
          <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <label style={{ color: theme.colors.textSecondary, fontFamily: theme.fonts.mono, fontSize: 10, letterSpacing: 2, display: "block", marginBottom: 4 }}>
                TICKERS (comma separated)
              </label>
              <input
                value={portfolioTickers}
                onChange={e => setPortfolioTickers(e.target.value.toUpperCase())}
                style={{ ...inputStyle, width: "100%" }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <motion.button
                whileHover={{ background: theme.colors.yellowGlow, boxShadow: theme.glow.yellow }}
                whileTap={{ scale: 0.95 }}
                onClick={runPortfolio}
                disabled={loading}
                style={btnStyle()}
              >
                ◈ OPTIMIZE
              </motion.button>
            </div>
          </div>

          {portfolio && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
                <Card label="EXPECTED RETURN" value={`${portfolio.expected_return}%/yr`} color={theme.colors.green} />
                <Card label="RISK" value={`${portfolio.risk}%`} color={theme.colors.red} />
                <Card label="SHARPE RATIO" value={portfolio.sharpe_ratio} color={theme.colors.yellow} />
              </div>
              {Object.entries(portfolio.weights).map(([t, w]) => (
                <div key={t} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontFamily: theme.fonts.mono, fontSize: 12 }}>
                    <span style={{ color: theme.colors.text }}>{t}</span>
                    <span style={{ color: theme.colors.yellow }}>{w}%</span>
                  </div>
                  <div style={{ background: theme.colors.bg, borderRadius: 4, height: 6, overflow: "hidden" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${w}%` }}
                      transition={{ duration: 0.8 }}
                      style={{
                        height: "100%",
                        background: `linear-gradient(90deg, ${theme.colors.yellow}, ${theme.colors.green})`,
                        borderRadius: 4,
                        boxShadow: theme.glow.yellow,
                      }}
                    />
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* MARKET — НОВОСТИ */}
        <SectionHeader id="market" title="MARKET FEED" subtitle="LIVE NEWS" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 32 }}
        >
          {news.slice(0, 6).map((item, i) => (
            <motion.a
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ x: 6, borderColor: theme.colors.yellow }}
              style={{
                display: "block",
                textDecoration: "none",
                background: theme.colors.bgCard,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: 8,
                padding: "16px 20px",
                marginBottom: 8,
                transition: "all 0.2s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                <div>
                  <div style={{ color: theme.colors.text, fontFamily: theme.fonts.mono, fontSize: 13, marginBottom: 6 }}>
                    {item.title}
                  </div>
                  <div style={{ color: theme.colors.textSecondary, fontFamily: theme.fonts.mono, fontSize: 11 }}>
                    {item.summary?.slice(0, 120)}...
                  </div>
                </div>
                <div style={{ minWidth: 80, textAlign: "right" }}>
                  <div style={{ color: theme.colors.yellow, fontFamily: theme.fonts.mono, fontSize: 10, letterSpacing: 1 }}>
                    {item.source}
                  </div>
                  <div style={{ color: theme.colors.textSecondary, fontFamily: theme.fonts.mono, fontSize: 10, marginTop: 4 }}>
                    {new Date(item.published).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </motion.div>

        {/* HISTORY */}
        <SectionHeader id="history" title="BACKTEST HISTORY" subtitle="DATABASE" />
        <HistorySection API={API} />

      </div>
      
      <AuthModal         
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onLogin={setUser}
      />
      
    </div>
  );
}

function HistorySection({ API }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios.get(`${API}/history`).then(r => setHistory(r.data)).catch(() => {});
  }, [API]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      style={{
        background: theme.colors.bgCard,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: 8,
        padding: 24,
      }}
    >
      {history.length === 0 ? (
        <div style={{ color: theme.colors.textSecondary, fontFamily: theme.fonts.mono, fontSize: 12 }}>
          No backtest history yet. Run a backtest to see results here.
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: theme.fonts.mono, fontSize: 12 }}>
          <thead>
            <tr>
              {["TICKER", "STRATEGY", "RETURN", "SHARPE", "DRAWDOWN", "TRADES", "DATE"].map(h => (
                <th key={h} style={{
                  color: theme.colors.yellow,
                  textAlign: "left",
                  padding: "8px 12px",
                  fontSize: 10,
                  letterSpacing: 2,
                  borderBottom: `1px solid ${theme.colors.border}`,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((row, i) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ background: theme.colors.bgCardHover }}
                style={{ borderBottom: `1px solid ${theme.colors.border}` }}
              >
                <td style={{ padding: "10px 12px", color: theme.colors.yellow }}>{row.ticker}</td>
                <td style={{ padding: "10px 12px", color: theme.colors.textSecondary }}>{row.strategy.toUpperCase()}</td>
                <td style={{ padding: "10px 12px", color: row.total_return >= 0 ? theme.colors.green : theme.colors.red }}>
                  {row.total_return}%
                </td>
                <td style={{ padding: "10px 12px", color: theme.colors.text }}>{row.sharpe_ratio}</td>
                <td style={{ padding: "10px 12px", color: theme.colors.red }}>{row.max_drawdown}%</td>
                <td style={{ padding: "10px 12px", color: theme.colors.text }}>{row.total_trades}</td>
                <td style={{ padding: "10px 12px", color: theme.colors.textSecondary }}>
                  {new Date(row.created_at).toLocaleDateString()}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      )}
    </motion.div>
  );
}