import { useState } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";

const API = "http://127.0.0.1:8000";

export default function App() {
  const [ticker, setTicker] = useState("AAPL");
  const [strategy, setStrategy] = useState("rsi");
  const [result, setResult] = useState(null);
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const color = result?.total_return >= 0 ? "#22c55e" : "#ef4444";

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

      {/* Контролы */}
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
        </select>
        <button
          onClick={runBacktest}
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

      {/* Результаты */}
      {result && stock && (
        <div>
          {/* Карточки метрик */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
            {[
              { label: "Тикер", value: result.ticker },
              { label: "Доходность", value: `${result.total_return}%`, color },
              { label: "Финальный капитал", value: `$${result.final_capital.toLocaleString()}`, color },
              { label: "Sharpe Ratio", value: result.sharpe_ratio },
              { label: "Макс. просадка", value: `${result.max_drawdown}%`, color: "#ef4444" },
              { label: "Сделок", value: result.total_trades },
              { label: "Цена сейчас", value: `$${stock.latest_price}` },
              { label: "Рост за год", value: `${stock.change_1y}%`, color: stock.change_1y >= 0 ? "#22c55e" : "#ef4444" },
            ].map((item, i) => (
              <div key={i} style={{
                background: "#1e293b", borderRadius: 12,
                padding: "20px", border: "1px solid #334155"
              }}>
                <div style={{ color: "#64748b", fontSize: 12, marginBottom: 8 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 22, fontWeight: "bold", color: item.color || "#e2e8f0" }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Стратегия */}
          <div style={{
            background: "#1e293b", borderRadius: 12,
            padding: "24px", border: "1px solid #334155"
          }}>
            <h2 style={{ color: "#38bdf8", marginBottom: 4 }}>
              {result.strategy === "rsi" ? "RSI стратегия" : "MA Crossover"}
            </h2>
            <p style={{ color: "#64748b", fontSize: 14 }}>
              {result.strategy === "rsi"
                ? "Покупает когда RSI < 30 (перепродана), продаёт когда RSI > 70 (перекуплена)"
                : "Покупает когда MA20 пересекает MA50 снизу вверх, продаёт при обратном пересечении"
              }
            </p>
            <div style={{ marginTop: 16, padding: 16, background: "#0f172a", borderRadius: 8 }}>
              <span style={{ color: "#64748b" }}>Начальный капитал: </span>
              <span style={{ color: "#e2e8f0" }}>${result.initial_capital.toLocaleString()}</span>
              <span style={{ color: "#64748b", marginLeft: 24 }}>Финальный: </span>
              <span style={{ color }}>${result.final_capital.toLocaleString()}</span>
              <span style={{ color: "#64748b", marginLeft: 24 }}>Прибыль: </span>
              <span style={{ color }}>
                ${(result.final_capital - result.initial_capital).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {!result && !loading && (
        <div style={{ 
          color: "#334155", fontSize: 18, 
          textAlign: "center", marginTop: 80 
        }}>
          Введи тикер и запусти бэктест →
        </div>
      )}
    </div>
  );
}