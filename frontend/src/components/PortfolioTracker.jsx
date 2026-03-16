import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { theme } from "../styles/theme";

const API = "http://127.0.0.1:8000";

export default function PortfolioTracker({ getHeaders }) {
  const [holdings, setHoldings] = useState([
    { ticker: "AAPL", shares: "10", avg_price: "150" }
  ]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const addHolding = () => {
    setHoldings([...holdings, { ticker: "", shares: "", avg_price: "" }]);
  };

  const removeHolding = (i) => {
    setHoldings(holdings.filter((_, idx) => idx !== i));
  };

  const updateHolding = (i, field, value) => {
    const updated = [...holdings];
    updated[i][field] = field === "ticker" ? value.toUpperCase() : value;
    setHoldings(updated);
  };

  const trackPortfolio = async () => {
    setLoading(true);
    try {
      const r = await axios.post(
        `${API}/portfolio/track`,
        { holdings: holdings.map(h => ({
          ticker: h.ticker,
          shares: parseFloat(h.shares),
          avg_price: parseFloat(h.avg_price)
        }))},
        { headers: getHeaders() }
      );
      setResult(r.data);
    } catch (e) {
      alert(e.response?.data?.detail || "Ошибка сервера");
    }
    setLoading(false);
  };

  const savePortfolio = async () => {
  try {
      await axios.post(
      `${API}/portfolio/save`,
      { holdings: holdings.map(h => ({
            ticker: h.ticker,
            shares: parseFloat(h.shares),
            avg_price: parseFloat(h.avg_price)
        }))},
        { headers: getHeaders() }
        );
        alert("Портфель сохранён ✅");
    } catch (e) {
        alert(e.response?.data?.detail || "Ошибка сохранения");
    }
    };

    const loadPortfolio = async () => {
    try {
        const r = await axios.get(`${API}/portfolio/load`, { headers: getHeaders() });
        if (r.data.holdings.length > 0) {
        setHoldings(r.data.holdings.map(h => ({
            ticker: h.ticker,
            shares: String(h.shares),
            avg_price: String(h.avg_price)
        })));
        } else {
        alert("Сохранённый портфель пуст");
        }
    } catch (e) {
        alert(e.response?.data?.detail || "Ошибка загрузки");
    }
    };







  const inputStyle = {
    background: theme.colors.bg,
    border: `1px solid ${theme.colors.border}`,
    color: theme.colors.text,
    padding: "8px 12px",
    borderRadius: 4,
    fontSize: 12,
    fontFamily: theme.fonts.mono,
    outline: "none",
    width: "100%",
  };

  return (
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
      <div style={{ color: theme.colors.yellow, fontFamily: theme.fonts.mono, fontSize: 11, letterSpacing: 2, marginBottom: 20 }}>
        // PORTFOLIO TRACKER
      </div>

      {/* Таблица ввода */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 8, marginBottom: 8 }}>
          {["ТИКЕР", "АКЦИЙ", "СРЕДНЯЯ ЦЕНА", ""].map(h => (
            <div key={h} style={{ color: theme.colors.textSecondary, fontFamily: theme.fonts.mono, fontSize: 10, letterSpacing: 2 }}>
              {h}
            </div>
          ))}
        </div>

        <AnimatePresence>
          {holdings.map((h, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 8, marginBottom: 8 }}
            >
              <input
                value={h.ticker}
                onChange={e => updateHolding(i, "ticker", e.target.value)}
                style={inputStyle}
                placeholder="AAPL"
              />
              <input
                value={h.shares}
                onChange={e => updateHolding(i, "shares", e.target.value)}
                style={inputStyle}
                placeholder="10"
                type="number"
              />
              <input
                value={h.avg_price}
                onChange={e => updateHolding(i, "avg_price", e.target.value)}
                style={inputStyle}
                placeholder="150.00"
                type="number"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => removeHolding(i)}
                style={{
                  background: "transparent",
                  border: `1px solid ${theme.colors.border}`,
                  color: theme.colors.red,
                  padding: "8px 12px",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontFamily: theme.fonts.mono,
                  fontSize: 12,
                }}
              >
                ✕
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Кнопки */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <motion.button
            whileHover={{ borderColor: theme.colors.yellow }}
            whileTap={{ scale: 0.95 }}
            onClick={addHolding}
            style={{
            background: "transparent",
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.textSecondary,
            padding: "8px 16px",
            borderRadius: 4,
            cursor: "pointer",
            fontFamily: theme.fonts.mono,
            fontSize: 11,
            letterSpacing: 1,
            }}
        >
            + ДОБАВИТЬ
        </motion.button>
        <motion.button
            whileHover={{ background: theme.colors.yellowGlow, boxShadow: theme.glow.yellow }}
            whileTap={{ scale: 0.95 }}
            onClick={trackPortfolio}
            disabled={loading}
            style={{
            background: "transparent",
            border: `1px solid ${theme.colors.yellow}`,
            color: theme.colors.yellow,
            padding: "8px 24px",
            borderRadius: 4,
            cursor: "pointer",
            fontFamily: theme.fonts.mono,
            fontSize: 11,
            letterSpacing: 2,
            fontWeight: "bold",
            transition: "all 0.2s",
            }}
        >
            {loading ? "ЗАГРУЗКА..." : "▶ ОТСЛЕЖИВАТЬ"}
        </motion.button>
        <motion.button
            whileHover={{ background: "rgba(0,255,136,0.1)" }}
            whileTap={{ scale: 0.95 }}
            onClick={savePortfolio}
            style={{
            background: "transparent",
            border: `1px solid ${theme.colors.green}`,
            color: theme.colors.green,
            padding: "8px 16px",
            borderRadius: 4,
            cursor: "pointer",
            fontFamily: theme.fonts.mono,
            fontSize: 11,
            letterSpacing: 1,
            }}
        >
            💾 СОХРАНИТЬ
        </motion.button>
        <motion.button
            whileHover={{ borderColor: theme.colors.yellow }}
            whileTap={{ scale: 0.95 }}
            onClick={loadPortfolio}
            style={{
            background: "transparent",
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.textSecondary,
            padding: "8px 16px",
            borderRadius: 4,
            cursor: "pointer",
            fontFamily: theme.fonts.mono,
            fontSize: 11,
            letterSpacing: 1,
            }}
        >
            📂 ЗАГРУЗИТЬ
        </motion.button>
      </div>

      {/* Результаты */}
      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Итого */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
            {[
              { label: "СТОИМОСТЬ", value: `$${result.total_value.toLocaleString()}`, color: theme.colors.yellow },
              { label: "ВЛОЖЕНО", value: `$${result.total_cost.toLocaleString()}`, color: theme.colors.text },
              { label: "P&L", value: `$${result.total_pnl.toFixed(2)}`, color: result.total_pnl >= 0 ? theme.colors.green : theme.colors.red },
              { label: "ДОХОДНОСТЬ", value: `${result.total_pnl_pct.toFixed(2)}%`, color: result.total_pnl_pct >= 0 ? theme.colors.green : theme.colors.red },
            ].map((card, i) => (
              <div key={i} style={{ background: theme.colors.bg, borderRadius: 8, padding: 16, border: `1px solid ${theme.colors.border}` }}>
                <div style={{ color: theme.colors.textSecondary, fontFamily: theme.fonts.mono, fontSize: 10, letterSpacing: 2, marginBottom: 8 }}>{card.label}</div>
                <div style={{ color: card.color, fontFamily: theme.fonts.mono, fontSize: 20, fontWeight: "bold" }}>{card.value}</div>
              </div>
            ))}
          </div>

          {/* Позиции */}
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: theme.fonts.mono, fontSize: 12 }}>
            <thead>
              <tr>
                {["ТИКЕР", "АКЦИЙ", "СРЕДНЯЯ", "ТЕКУЩАЯ", "СТОИМОСТЬ", "P&L", "%"].map(h => (
                  <th key={h} style={{
                    color: theme.colors.yellow, textAlign: "left",
                    padding: "8px 12px", fontSize: 10, letterSpacing: 2,
                    borderBottom: `1px solid ${theme.colors.border}`,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.positions.map((pos, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  style={{ borderBottom: `1px solid ${theme.colors.border}` }}
                >
                  <td style={{ padding: "10px 12px", color: theme.colors.yellow }}>{pos.ticker}</td>
                  <td style={{ padding: "10px 12px", color: theme.colors.text }}>{pos.shares}</td>
                  <td style={{ padding: "10px 12px", color: theme.colors.textSecondary }}>${pos.avg_price}</td>
                  <td style={{ padding: "10px 12px", color: theme.colors.text }}>${pos.current_price}</td>
                  <td style={{ padding: "10px 12px", color: theme.colors.yellow }}>${pos.value?.toLocaleString()}</td>
                  <td style={{ padding: "10px 12px", color: pos.pnl >= 0 ? theme.colors.green : theme.colors.red }}>
                    ${pos.pnl?.toFixed(2)}
                  </td>
                  <td style={{ padding: "10px 12px", color: pos.pnl_pct >= 0 ? theme.colors.green : theme.colors.red }}>
                    {pos.pnl_pct?.toFixed(2)}%
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </motion.div>
  );
}