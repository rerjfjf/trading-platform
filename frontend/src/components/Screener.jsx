import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { theme } from "../styles/theme";

const API = "http://127.0.0.1:8000";

export default function Screener({ getHeaders }) {
  const [filters, setFilters] = useState({
    min_return: "",
    max_volatility: "",
    min_sharpe: "",
    max_rsi: "",
    min_rsi: "",
    ma_signal: "",
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runScreener = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.min_return) params.min_return = parseFloat(filters.min_return);
      if (filters.max_volatility) params.max_volatility = parseFloat(filters.max_volatility);
      if (filters.min_sharpe) params.min_sharpe = parseFloat(filters.min_sharpe);
      if (filters.max_rsi) params.max_rsi = parseFloat(filters.max_rsi);
      if (filters.min_rsi) params.min_rsi = parseFloat(filters.min_rsi);
      if (filters.ma_signal) params.ma_signal = filters.ma_signal;

      const r = await axios.get(`${API}/screener`, {
        params,
        headers: getHeaders()
      });
      setResults(r.data);
    } catch (e) {
      alert(e.response?.data?.detail || "Ошибка сервера");
    }
    setLoading(false);
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

  const presets = [
    { label: "Перепроданные", filters: { max_rsi: "35", min_sharpe: "0.3" } },
    { label: "Лучший Sharpe", filters: { min_sharpe: "1.0" } },
    { label: "Низкий риск", filters: { max_volatility: "25", min_return: "10" } },
    { label: "Бычий тренд", filters: { ma_signal: "BULLISH", min_sharpe: "0.5" } },
  ];

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
        // STOCK SCREENER
      </div>

      {/* Пресеты */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {presets.map(p => (
          <motion.button
            key={p.label}
            whileHover={{ borderColor: theme.colors.yellow, color: theme.colors.yellow }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilters({ ...filters, ...p.filters })}
            style={{
              background: "transparent",
              border: `1px solid ${theme.colors.border}`,
              color: theme.colors.textSecondary,
              padding: "6px 14px",
              borderRadius: 4,
              cursor: "pointer",
              fontFamily: theme.fonts.mono,
              fontSize: 11,
              transition: "all 0.2s",
            }}
          >
            {p.label}
          </motion.button>
        ))}
      </div>

      {/* Фильтры */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { key: "min_return", label: "МИН. ДОХОДНОСТЬ (%)" },
          { key: "max_volatility", label: "МАКС. ВОЛАТИЛЬНОСТЬ (%)" },
          { key: "min_sharpe", label: "МИН. SHARPE RATIO" },
          { key: "min_rsi", label: "МИН. RSI" },
          { key: "max_rsi", label: "МАКС. RSI" },
        ].map(f => (
          <div key={f.key}>
            <label style={{ color: theme.colors.textSecondary, fontFamily: theme.fonts.mono, fontSize: 10, letterSpacing: 2, display: "block", marginBottom: 4 }}>
              {f.label}
            </label>
            <input
              value={filters[f.key]}
              onChange={e => setFilters({ ...filters, [f.key]: e.target.value })}
              style={inputStyle}
              placeholder="не задано"
              type="number"
            />
          </div>
        ))}
        <div>
          <label style={{ color: theme.colors.textSecondary, fontFamily: theme.fonts.mono, fontSize: 10, letterSpacing: 2, display: "block", marginBottom: 4 }}>
            MA СИГНАЛ
          </label>
          <select
            value={filters.ma_signal}
            onChange={e => setFilters({ ...filters, ma_signal: e.target.value })}
            style={inputStyle}
          >
            <option value="">Любой</option>
            <option value="BULLISH">BULLISH ↑</option>
            <option value="BEARISH">BEARISH ↓</option>
          </select>
        </div>
      </div>

      {/* Кнопки */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <motion.button
          whileHover={{ background: theme.colors.yellowGlow, boxShadow: theme.glow.yellow }}
          whileTap={{ scale: 0.95 }}
          onClick={runScreener}
          disabled={loading}
          style={{
            background: "transparent",
            border: `1px solid ${theme.colors.yellow}`,
            color: theme.colors.yellow,
            padding: "10px 24px",
            borderRadius: 4,
            cursor: "pointer",
            fontFamily: theme.fonts.mono,
            fontSize: 12,
            fontWeight: "bold",
            letterSpacing: 2,
            transition: "all 0.2s",
          }}
        >
          {loading ? "СКАНИРУЕМ... (~1 мин)" : "▶ ЗАПУСТИТЬ СКРИНЕР"}
        </motion.button>
        <motion.button
          whileHover={{ borderColor: theme.colors.border }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setFilters({ min_return: "", max_volatility: "", min_sharpe: "", max_rsi: "", min_rsi: "", ma_signal: "" })}
          style={{
            background: "transparent",
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.textSecondary,
            padding: "10px 16px",
            borderRadius: 4,
            cursor: "pointer",
            fontFamily: theme.fonts.mono,
            fontSize: 11,
          }}
        >
          СБРОСИТЬ
        </motion.button>
      </div>

      {/* Результаты */}
      {results && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ color: theme.colors.green, fontFamily: theme.fonts.mono, fontSize: 11, letterSpacing: 2, marginBottom: 16 }}>
            НАЙДЕНО: {results.count} АКЦИЙ
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: theme.fonts.mono, fontSize: 12 }}>
            <thead>
              <tr>
                {["ТИКЕР", "ЦЕНА", "ДОХОДНОСТЬ", "ВОЛАТИЛЬНОСТЬ", "SHARPE", "RSI", "MA СИГНАЛ", "ПРОСАДКА"].map(h => (
                  <th key={h} style={{
                    color: theme.colors.yellow, textAlign: "left",
                    padding: "8px 12px", fontSize: 10, letterSpacing: 2,
                    borderBottom: `1px solid ${theme.colors.border}`,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.results.map((s, i) => (
                <motion.tr
                  key={s.ticker}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ background: theme.colors.bgCardHover }}
                  style={{ borderBottom: `1px solid ${theme.colors.border}`, cursor: "pointer" }}
                  onClick={() => {
                    // Копируем тикер в буфер
                    navigator.clipboard.writeText(s.ticker);
                  }}
                >
                  <td style={{ padding: "10px 12px", color: theme.colors.yellow, fontWeight: "bold" }}>{s.ticker}</td>
                  <td style={{ padding: "10px 12px", color: theme.colors.text }}>${s.price}</td>
                  <td style={{ padding: "10px 12px", color: s.return_1y >= 0 ? theme.colors.green : theme.colors.red }}>
                    {s.return_1y}%
                  </td>
                  <td style={{ padding: "10px 12px", color: theme.colors.text }}>{s.volatility}%</td>
                  <td style={{ padding: "10px 12px", color: s.sharpe >= 1 ? theme.colors.green : theme.colors.yellow }}>
                    {s.sharpe}
                  </td>
                  <td style={{ padding: "10px 12px", color: s.rsi <= 30 ? theme.colors.green : s.rsi >= 70 ? theme.colors.red : theme.colors.text }}>
                    {s.rsi}
                  </td>
                  <td style={{ padding: "10px 12px", color: s.ma_signal === "BULLISH" ? theme.colors.green : theme.colors.red }}>
                    {s.ma_signal === "BULLISH" ? "↑ BULLISH" : "↓ BEARISH"}
                  </td>
                  <td style={{ padding: "10px 12px", color: theme.colors.red }}>{s.max_drawdown}%</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </motion.div>
  );
}