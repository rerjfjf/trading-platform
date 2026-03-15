import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { theme } from "../styles/theme";

const AUTH_API = "http://localhost:3001/auth";

export default function AuthModal({ isOpen, onClose, onLogin }) {
  const [mode, setMode] = useState("login"); // login | register
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputStyle = {
    background: theme.colors.bg,
    border: `1px solid ${theme.colors.border}`,
    color: theme.colors.text,
    padding: "10px 16px",
    borderRadius: 6,
    fontSize: 13,
    fontFamily: theme.fonts.mono,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/login" : "/register";
      const payload = mode === "login"
        ? { username: form.username, password: form.password }
        : { username: form.username, email: form.email, password: form.password };

      const res = await axios.post(`${AUTH_API}${endpoint}`, payload);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      onLogin(res.data.user);
      onClose();
    } catch (e) {
      setError(e.response?.data?.error || "Ошибка сервера");
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Оверлей */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.8)",
              zIndex: 2000,
              backdropFilter: "blur(4px)",
            }}
          />

          {/* Модалка */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{
              position: "fixed",
              top: 0, left: 0, right: 0, bottom: 0,
              margin: "auto",
              height: "fit-content",
              zIndex: 2001,
              background: theme.colors.bgCard,
              border: `1px solid ${theme.colors.yellow}`,
              borderRadius: 12,
              padding: 32,
              width: 400,
              boxShadow: `0 0 40px rgba(255,215,0,0.2)`,
            }}
          >
            {/* Заголовок */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: theme.colors.yellow, fontFamily: theme.fonts.mono, fontSize: 11, letterSpacing: 3, marginBottom: 8 }}>
                // TRADE_SYS
              </div>
              <div style={{ color: theme.colors.text, fontFamily: theme.fonts.mono, fontSize: 20, fontWeight: "bold" }}>
                {mode === "login" ? "ВХОД В СИСТЕМУ" : "РЕГИСТРАЦИЯ"}
              </div>
            </div>

            {/* Табы */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
              {["login", "register"].map(m => (
                <motion.button
                  key={m}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setMode(m); setError(""); }}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: 6,
                    border: `1px solid ${mode === m ? theme.colors.yellow : theme.colors.border}`,
                    background: mode === m ? theme.colors.yellowGlow : "transparent",
                    color: mode === m ? theme.colors.yellow : theme.colors.textSecondary,
                    fontFamily: theme.fonts.mono,
                    fontSize: 11,
                    letterSpacing: 2,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {m === "login" ? "ВОЙТИ" : "СОЗДАТЬ АККАУНТ"}
                </motion.button>
              ))}
            </div>

            {/* Форма */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ color: theme.colors.textSecondary, fontFamily: theme.fonts.mono, fontSize: 10, letterSpacing: 2, display: "block", marginBottom: 6 }}>
                  USERNAME
                </label>
                <input
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  style={inputStyle}
                  placeholder="trader"
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                />
              </div>

              {mode === "register" && (
                <div>
                  <label style={{ color: theme.colors.textSecondary, fontFamily: theme.fonts.mono, fontSize: 10, letterSpacing: 2, display: "block", marginBottom: 6 }}>
                    EMAIL
                  </label>
                  <input
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    style={inputStyle}
                    placeholder="trader@email.com"
                    type="email"
                  />
                </div>
              )}

              <div>
                <label style={{ color: theme.colors.textSecondary, fontFamily: theme.fonts.mono, fontSize: 10, letterSpacing: 2, display: "block", marginBottom: 6 }}>
                  PASSWORD
                </label>
                <input
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={inputStyle}
                  placeholder="••••••••"
                  type="password"
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    color: theme.colors.red,
                    fontFamily: theme.fonts.mono,
                    fontSize: 12,
                    padding: "8px 12px",
                    background: "rgba(255,68,68,0.1)",
                    borderRadius: 6,
                    border: `1px solid ${theme.colors.red}`,
                  }}
                >
                  ✗ {error}
                </motion.div>
              )}

              <motion.button
                whileHover={{ background: theme.colors.yellowGlow, boxShadow: theme.glow.yellow }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  background: "transparent",
                  border: `1px solid ${theme.colors.yellow}`,
                  color: theme.colors.yellow,
                  padding: "12px",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontFamily: theme.fonts.mono,
                  letterSpacing: 2,
                  marginTop: 8,
                  transition: "all 0.2s",
                }}
              >
                {loading ? "ЗАГРУЗКА..." : mode === "login" ? "▶ ВОЙТИ" : "▶ СОЗДАТЬ"}
              </motion.button>
            </div>

            {/* Планы */}
            {mode === "register" && (
              <div style={{ marginTop: 20, padding: 16, background: theme.colors.bg, borderRadius: 8, border: `1px solid ${theme.colors.border}` }}>
                <div style={{ color: theme.colors.yellow, fontFamily: theme.fonts.mono, fontSize: 10, letterSpacing: 2, marginBottom: 10 }}>
                  // ПЛАНЫ
                </div>
                {[
                  { plan: "FREE", desc: "10 запросов/день, только RSI", color: theme.colors.textSecondary },
                  { plan: "PRO", desc: "100 запросов, все стратегии", color: theme.colors.yellow },
                  { plan: "PREMIUM", desc: "Без ограничений, всё", color: theme.colors.green },
                ].map(p => (
                  <div key={p.plan} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontFamily: theme.fonts.mono, fontSize: 11 }}>
                    <span style={{ color: p.color }}>{p.plan}</span>
                    <span style={{ color: theme.colors.textSecondary }}>{p.desc}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}