import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { theme } from "../styles/theme";

const DEEPSEEK_API = "https://api.deepseek.com/v1/chat/completions";
const API_KEY = process.env.REACT_APP_DEEPSEEK_KEY;

export default function AIAssistant({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Привет! Я AI ассистент торговой платформы TRADE_SYS. Могу помочь с анализом акций, объяснить финансовые термины, интерпретировать результаты бэктестов. Что хочешь узнать?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
    const response = await fetch("http://127.0.0.1:8000/ai/chat", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
        messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            userMessage
        ]
        })
    });

    const data = await response.json();
    const assistantMessage = {
        role: "assistant",
        content: data.content
    };
    setMessages(prev => [...prev, assistantMessage]);
    } catch (e) {
    setMessages(prev => [...prev, {
        role: "assistant",
        content: "Ошибка соединения. Попробуй ещё раз."
    }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Кнопка открытия */}
      <motion.button
        whileHover={{ scale: 1.05, boxShadow: theme.glow.yellow }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: 32,
          right: 32,
          zIndex: 1500,
          background: theme.colors.bgCard,
          border: `1px solid ${theme.colors.yellow}`,
          color: theme.colors.yellow,
          padding: "14px 20px",
          borderRadius: 8,
          cursor: "pointer",
          fontFamily: theme.fonts.mono,
          fontSize: 13,
          fontWeight: "bold",
          letterSpacing: 2,
          display: "flex",
          alignItems: "center",
          gap: 8,
          boxShadow: `0 0 20px rgba(255,215,0,0.1)`,
        }}
      >
        <motion.span
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ◈
        </motion.span>
        AI
      </motion.button>

      {/* Чат окно */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: "fixed", inset: 0,
                background: "rgba(0,0,0,0.5)",
                zIndex: 1600,
                backdropFilter: "blur(4px)",
              }}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              style={{
                position: "fixed",
                bottom: 100,
                right: 32,
                zIndex: 1700,
                width: 420,
                height: 560,
                background: theme.colors.bgCard,
                border: `1px solid ${theme.colors.yellow}`,
                borderRadius: 12,
                display: "flex",
                flexDirection: "column",
                boxShadow: `0 0 40px rgba(255,215,0,0.15)`,
                overflow: "hidden",
              }}
            >
              {/* Заголовок */}
              <div style={{
                padding: "16px 20px",
                borderBottom: `1px solid ${theme.colors.border}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <div>
                  <div style={{ color: theme.colors.yellow, fontFamily: theme.fonts.mono, fontSize: 10, letterSpacing: 2, marginBottom: 2 }}>
                    // AI ASSISTANT — DEEPSEEK
                  </div>
                  <div style={{ color: theme.colors.text, fontFamily: theme.fonts.mono, fontSize: 13, fontWeight: "bold" }}>
                    TRADE_SYS AI
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: theme.colors.textSecondary,
                    cursor: "pointer",
                    fontSize: 18,
                  }}
                >
                  ✕
                </motion.button>
              </div>

              {/* Сообщения */}
              <div style={{
                flex: 1,
                overflowY: "auto",
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      display: "flex",
                      justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                    }}
                  >
                    <div style={{
                      maxWidth: "80%",
                      padding: "10px 14px",
                      borderRadius: msg.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                      background: msg.role === "user" ? theme.colors.yellowGlow : theme.colors.bg,
                      border: `1px solid ${msg.role === "user" ? theme.colors.yellow : theme.colors.border}`,
                      color: theme.colors.text,
                      fontFamily: theme.fonts.mono,
                      fontSize: 12,
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                    }}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}

                {loading && (
                  <div style={{ display: "flex", justifyContent: "flex-start" }}>
                    <div style={{
                      padding: "10px 14px",
                      borderRadius: "12px 12px 12px 2px",
                      background: theme.colors.bg,
                      border: `1px solid ${theme.colors.border}`,
                    }}>
                      <motion.span
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        style={{ color: theme.colors.yellow, fontFamily: theme.fonts.mono, fontSize: 12 }}
                      >
                        ▋ думаю...
                      </motion.span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Инпут */}
              <div style={{
                padding: 16,
                borderTop: `1px solid ${theme.colors.border}`,
                display: "flex",
                gap: 8,
              }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                  placeholder="Спроси про акции, стратегии..."
                  style={{
                    flex: 1,
                    background: theme.colors.bg,
                    border: `1px solid ${theme.colors.border}`,
                    color: theme.colors.text,
                    padding: "10px 14px",
                    borderRadius: 6,
                    fontFamily: theme.fonts.mono,
                    fontSize: 12,
                    outline: "none",
                  }}
                />
                <motion.button
                  whileHover={{ background: theme.colors.yellowGlow }}
                  whileTap={{ scale: 0.95 }}
                  onClick={sendMessage}
                  disabled={loading}
                  style={{
                    background: "transparent",
                    border: `1px solid ${theme.colors.yellow}`,
                    color: theme.colors.yellow,
                    padding: "10px 16px",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontFamily: theme.fonts.mono,
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                >
                  ▶
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}