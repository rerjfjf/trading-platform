import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { theme } from "../styles/theme";

const ASCII_LOGO = `
 ████████╗██████╗  █████╗ ██████╗ ███████╗
    ██╔══╝██╔══██╗██╔══██╗██╔══██╗██╔════╝
    ██║   ██████╔╝███████║██║  ██║█████╗  
    ██║   ██╔══██╗██╔══██║██║  ██║██╔══╝  
    ██║   ██║  ██║██║  ██║██████╔╝███████╗
`.trim();

const NAV_ITEMS = [
  { label: "DASHBOARD", path: "#dashboard" },
  { label: "RESEARCH", path: "#research" },
  { label: "MARKET", path: "#market" },
  { label: "MODELS", path: "#models" },
  { label: "HISTORY", path: "#history" },
];

export default function Navbar({ activeSection }) {
  const [time, setTime] = useState(new Date());
  const [marketStatus, setMarketStatus] = useState("OPEN");

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const hour = new Date().getHours();
    setMarketStatus(hour >= 9 && hour < 17 ? "OPEN" : "CLOSED");
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.95)",
        borderBottom: `1px solid ${theme.colors.border}`,
        backdropFilter: "blur(10px)",
        padding: "0 32px",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: theme.fonts.mono,
      }}
    >
      {/* Лого */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        style={{
          color: theme.colors.yellow,
          fontSize: 18,
          fontWeight: "bold",
          letterSpacing: 2,
          cursor: "pointer",
          textShadow: theme.glow.yellow,
        }}
      >
        ▶ TRADE
        <span style={{ color: theme.colors.green }}>_</span>
        SYS
      </motion.div>

      {/* Навигация */}
      <div style={{ display: "flex", gap: 8 }}>
        {NAV_ITEMS.map((item) => (
          <motion.a
            key={item.label}
            href={item.path}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              color: activeSection === item.label ? theme.colors.yellow : theme.colors.textSecondary,
              textDecoration: "none",
              fontSize: 11,
              letterSpacing: 2,
              padding: "6px 12px",
              borderRadius: 4,
              border: activeSection === item.label
                ? `1px solid ${theme.colors.yellow}`
                : "1px solid transparent",
              background: activeSection === item.label
                ? theme.colors.yellowGlow
                : "transparent",
              transition: "all 0.2s",
              cursor: "pointer",
            }}
          >
            {item.label}
          </motion.a>
        ))}
      </div>

      {/* Статус */}
      <div style={{ display: "flex", gap: 24, alignItems: "center", fontSize: 11 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              width: 6, height: 6, borderRadius: "50%",
              background: marketStatus === "OPEN" ? theme.colors.green : theme.colors.red
            }}
          />
          <span style={{
            color: marketStatus === "OPEN" ? theme.colors.green : theme.colors.red,
            fontFamily: theme.fonts.mono,
            letterSpacing: 1,
          }}>
            NYSE {marketStatus}
          </span>
        </div>
        <span style={{ color: theme.colors.textSecondary, fontFamily: theme.fonts.mono }}>
          {time.toLocaleTimeString("en-US", { hour12: false })}
        </span>
      </div>
    </motion.nav>
  );
}