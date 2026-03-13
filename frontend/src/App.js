import { useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000";

const Card = ({ label, value, color }) => (
  <div style={{
    background: "#1e293b", borderRadius: 12,
    padding: "20px", border: "1px solid #334155"
  }}>
    <div style={{ color: "#64748b", fontSize: 12, marginBottom: 8 }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: "bold", color: color || "#e2e8f0" }}>{value}</div>
  </div>
);

export default function App() {
  const [ticker, setTicker] = useState("AAPL");
  const [strategy, setStrategy] = useState("rsi");
  const [result, setResult] = useState(null);
  const [stock, setStock] = useState(null);
  const [mc, setMc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("backtest");

  const runBacktest = async () => {
    setLoading(true);
    try {
      const [backtestRes, stockRes] = await Promise.all([
        axios.post(`${API}/backtest`, { ticker, period: "2y", strategy }),
        axios.get(`${API}/stock/${ticker}`)
      ]);
      setResult(backtestRes.data);
      setStock(stockRes.data);
    } catch (e) {
      alert("Ошибка — убедись что сервер запущен");
    }
    setLoading(false);
  };

  const runMonteCarlo = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/monte-carlo`, {
        ticker, days: 126, simulations: 1000
      });
      setMc(res.data);
    } catch (e) {
      alert("Ошибка — убедись что сервер запущен");
    }
    setLoading(false);
  };

  const color = result?.total_return >= 0 ? "#22c55e" : "#ef4444";

  const tabStyle = (t) => ({
    padding: "10px 24px", borderRadius: 8, cursor: "pointer",
    fontFamily: "monospace", fontSize: 14, border: "none",
    background: tab === t ? "#38bdf8" : "#1e293b",
    color: tab === t ? "#0f172a" : "#64748b",
    fontWeight: tab === t ? "bold" : "normal"
  });

  return (
    <div style={{
      minHeight: "100vh", background: "#0f172a",
      color: "#e2e8f0", fontFamily: "monospace", padding: "40px"
    }}>
      <h1 style={{ fontSize: 28, color: "#38bdf8", marginBottom: 8 }}>
        Trading Platform
      </h1>
      <p style={{ color: "#64748b", marginBottom: 32 }}>
        Algorithmic backtesting & portfolio analysis
      </p>

      {/* Табы */}
      <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
        <button style={tabStyle("backtest")} onClick={() => setTab("backtest")}>
          Бэктест
        </button>
        <button style={tabStyle("montecarlo")} onClick={() => setTab("montecarlo")}>
          Monte Carlo
        </button>
      </div>

      {/* Инпуты */}
      <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
        <input
          value={ticker}
          onChange={e => setTicker(e.target.value.toUpperCase())}
          placeholder="Тикер (AAPL, TSLA...)"
          style={{
            background: "#1e293b", border: "1px solid #334155",
            color: "#e2e8f0", padding: "10px 16px", borderRadius: 8,
            fontSize: 16, width: 200, fontFamily: "monospace"
          }}
        />
        {tab === "backtest" && (
          <select
            value={strategy}
            onChange={e => setStrategy(e.target.value)}
            style={{
              background: "#1e293b", border: "1px solid #334155",
              color: "#e2e8f0", padding: "10px 16px", borderRadius: 8,
              fontSize: 16, fontFamily: "monospace"
            }}
          >
            <option value="rsi">RSI стратегия</option>
            <option value="ma">MA Crossover</option>
            <option value="macd">MACD</option>
          </select>
        )}
        <button
          onClick={tab === "backtest" ? runBacktest : runMonteCarlo}
          disabled={loading}
          style={{
            background: "#38bdf8", color: "#0f172a", border: "none",
            padding: "10px 24px", borderRadius: 8, fontSize: 16,
            fontWeight: "bold", cursor: "pointer", fontFamily: "monospace"
          }}
        >
          {loading ? "Загрузка..." : "Запустить →"}
        </button>
      </div>

      {/* Бэктест */}
      {tab === "backtest" && result && stock && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
            <Card label="Тикер" value={result.ticker} />
            <Card label="Доходность" value={`${result.total_return}%`} color={color} />
            <Card label="Финальный капитал" value={`$${result.final_capital.toLocaleString()}`} color={color} />
            <Card label="Sharpe Ratio" value={result.sharpe_ratio} />
            <Card label="Макс. просадка" value={`${result.max_drawdown}%`} color="#ef4444" />
            <Card label="Сделок" value={result.total_trades} />
            <Card label="Цена сейчас" value={`$${stock.latest_price}`} />
            <Card label="Рост за год" value={`${stock.change_1y}%`} color={stock.change_1y >= 0 ? "#22c55e" : "#ef4444"} />
          </div>
          <div style={{
            background: "#1e293b", borderRadius: 12,
            padding: "24px", border: "1px solid #334155"
          }}>
            <h2 style={{ color: "#38bdf8", marginBottom: 4 }}>
              {result.strategy === "rsi" ? "RSI стратегия" : "MA Crossover"}
            </h2>
            <p style={{ color: "#64748b", fontSize: 14 }}>
              {result.strategy === "rsi"
                ? "Покупает когда RSI < 30, продаёт когда RSI > 70"
                : "Покупает когда MA20 пересекает MA50 снизу вверх"
              }
            </p>
            <div style={{ marginTop: 16, padding: 16, background: "#0f172a", borderRadius: 8 }}>
              <span style={{ color: "#64748b" }}>Начальный капитал: </span>
              <span>${result.initial_capital.toLocaleString()}</span>
              <span style={{ color: "#64748b", marginLeft: 24 }}>Финальный: </span>
              <span style={{ color }}>${result.final_capital.toLocaleString()}</span>
              <span style={{ color: "#64748b", marginLeft: 24 }}>Прибыль: </span>
              <span style={{ color }}>${(result.final_capital - result.initial_capital).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Monte Carlo */}
      {tab === "montecarlo" && mc && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
            <Card label="Текущая цена" value={`$${mc.last_price}`} />
            <Card label="Вероятность прибыли" value={`${mc.prob_profit}%`} color={mc.prob_profit >= 50 ? "#22c55e" : "#ef4444"} />
            <Card label="Период" value={`${mc.days} дней`} />
            <Card label="Худший сценарий 5%" value={`$${mc.percentile_5}`} color="#ef4444" />
            <Card label="Медиана 50%" value={`$${mc.percentile_50}`} color="#38bdf8" />
            <Card label="Лучший сценарий 95%" value={`$${mc.percentile_95}`} color="#22c55e" />
          </div>
          <div style={{
            background: "#1e293b", borderRadius: 12,
            padding: "24px", border: "1px solid #334155"
          }}>
            <h2 style={{ color: "#38bdf8", marginBottom: 16 }}>
              Диапазон цен через {mc.days} дней
            </h2>
            <div style={{ position: "relative", height: 24, background: "#0f172a", borderRadius: 12, overflow: "hidden" }}>
              <div style={{
                position: "absolute", height: "100%", borderRadius: 12,
                background: "linear-gradient(90deg, #ef4444, #38bdf8, #22c55e)",
                width: "100%", opacity: 0.7
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, color: "#64748b", fontSize: 12 }}>
              <span style={{ color: "#ef4444" }}>${mc.percentile_5} (5%)</span>
              <span style={{ color: "#fbbf24" }}>${mc.percentile_25} (25%)</span>
              <span style={{ color: "#38bdf8" }}>${mc.percentile_50} (50%)</span>
              <span style={{ color: "#a3e635" }}>${mc.percentile_75} (75%)</span>
              <span style={{ color: "#22c55e" }}>${mc.percentile_95} (95%)</span>
            </div>
          </div>
        </div>
      )}

      {!result && !mc && !loading && (
        <div style={{ color: "#334155", fontSize: 18, textAlign: "center", marginTop: 80 }}>
          Введи тикер и запустить →
        </div>
      )}
    </div>
  );
}