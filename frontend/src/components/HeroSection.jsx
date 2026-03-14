import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { theme } from "../styles/theme";

const ASCII_ART = `
 ████████╗██████╗  █████╗ ██████╗ ███████╗
    ██╔══╝██╔══██╗██╔══██╗██╔══██╗██╔════╝
    ██║   ██████╔╝███████║██║  ██║█████╗  
    ██║   ██╔══██╗██╔══██║██║  ██║██╔══╝  
    ██║   ██║  ██║██║  ██║██████╔╝███████╗
    ╚═╝   ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝
`;

const TYPING_LINES = [
  "> Initializing trading systems...",
  "> Loading market data...",
  "> Connecting to NYSE, NASDAQ...",
  "> Mathematical models ready.",
  "> Rust engine: 115x faster.",
  "> System ready. Welcome, trader.",
];

function TypingText({ lines }) {
  const [displayed, setDisplayed] = useState([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);

  useEffect(() => {
    if (currentLine >= lines.length) return;

    if (currentChar < lines[currentLine].length) {
      const timer = setTimeout(() => {
        setCurrentChar(c => c + 1);
      }, 30);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setDisplayed(d => [...d, lines[currentLine]]);
        setCurrentLine(l => l + 1);
        setCurrentChar(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentChar, currentLine, lines]);

  return (
    <div style={{ fontFamily: theme.fonts.mono, fontSize: 13 }}>
      {displayed.map((line, i) => (
        <div key={i} style={{ color: theme.colors.textSecondary, marginBottom: 4 }}>
          {line}
        </div>
      ))}
      {currentLine < lines.length && (
        <div style={{ color: theme.colors.green }}>
          {lines[currentLine].slice(0, currentChar)}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >▋</motion.span>
        </div>
      )}
    </div>
  );
}

export default function HeroSection() {
  return (
    <section style={{
      minHeight: "100vh",
      background: theme.colors.bg,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: "80px 32px 40px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Сетка фона */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,215,0,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,215,0,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "50px 50px",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        {/* ASCII арт */}
        <motion.pre
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            color: theme.colors.yellow,
            fontFamily: theme.fonts.mono,
            fontSize: "clamp(6px, 1.2vw, 14px)",
            lineHeight: 1.2,
            marginBottom: 32,
            textShadow: theme.glow.yellow,
            letterSpacing: 1,
          }}
        >
          {ASCII_ART}
        </motion.pre>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
          {/* Левая колонка */}
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{
                background: theme.colors.bgCard,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: 8,
                padding: 24,
                marginBottom: 24,
              }}
            >
              <div style={{
                color: theme.colors.yellow,
                fontFamily: theme.fonts.mono,
                fontSize: 11,
                letterSpacing: 2,
                marginBottom: 16,
              }}>
                // SYSTEM BOOT
              </div>
              <TypingText lines={TYPING_LINES} />
            </motion.div>

            {/* Статистика */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { label: "СТРАТЕГИЙ", value: "4", color: theme.colors.yellow },
                { label: "RUST SPEED", value: "115x", color: theme.colors.green },
                { label: "МОДЕЛЕЙ", value: "6", color: theme.colors.yellow },
                { label: "ЭНДПОИНТОВ", value: "15", color: theme.colors.green },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + i * 0.1 }}
                  whileHover={{ scale: 1.03, borderColor: theme.colors.yellow }}
                  style={{
                    background: theme.colors.bgCard,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: 8,
                    padding: "16px",
                    textAlign: "center",
                    cursor: "default",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{
                    color: stat.color,
                    fontFamily: theme.fonts.mono,
                    fontSize: 28,
                    fontWeight: "bold",
                    textShadow: stat.color === theme.colors.yellow ? theme.glow.yellow : theme.glow.green,
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    color: theme.colors.textSecondary,
                    fontFamily: theme.fonts.mono,
                    fontSize: 10,
                    letterSpacing: 2,
                    marginTop: 4,
                  }}>
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Правая колонка — фичи */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div style={{
              color: theme.colors.yellow,
              fontFamily: theme.fonts.mono,
              fontSize: 11,
              letterSpacing: 2,
              marginBottom: 16,
            }}>
              // CAPABILITIES
            </div>
            {[
              { icon: "◈", label: "Backtesting Engine", desc: "4 стратегии на Rust 🦀", color: theme.colors.yellow },
              { icon: "◈", label: "Monte Carlo", desc: "1000 симуляций будущего", color: theme.colors.yellow },
              { icon: "◈", label: "LSTM Neural Network", desc: "Предсказание цен через AI", color: theme.colors.green },
              { icon: "◈", label: "Black-Scholes", desc: "Нобелевская формула опционов", color: theme.colors.yellow },
              { icon: "◈", label: "Markowitz", desc: "Оптимизация портфеля", color: theme.colors.yellow },
              { icon: "◈", label: "Stress Testing", desc: "Кризисы 2000-2022", color: theme.colors.green },
              { icon: "◈", label: "VaR / CVaR", desc: "Риск-метрики банков", color: theme.colors.yellow },
              { icon: "◈", label: "Correlation Matrix", desc: "Диверсификация портфеля", color: theme.colors.yellow },
            ].map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.07 }}
                whileHover={{
                  x: 6,
                  background: theme.colors.bgCardHover,
                  borderColor: theme.colors.yellow,
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: 6,
                  marginBottom: 6,
                  cursor: "default",
                  transition: "all 0.2s",
                }}
              >
                <span style={{ color: feat.color, fontSize: 16 }}>{feat.icon}</span>
                <div>
                  <div style={{
                    color: theme.colors.text,
                    fontFamily: theme.fonts.mono,
                    fontSize: 12,
                    fontWeight: "bold",
                  }}>
                    {feat.label}
                  </div>
                  <div style={{
                    color: theme.colors.textSecondary,
                    fontFamily: theme.fonts.mono,
                    fontSize: 10,
                  }}>
                    {feat.desc}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}