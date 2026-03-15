import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { theme } from "../styles/theme";

const AUTH_API = "http://localhost:3001";

export default function AdminPanel({ user, onClose }) {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        axios.get(`${AUTH_API}/admin/users`, { headers: getHeaders() }),
        axios.get(`${AUTH_API}/admin/stats`, { headers: getHeaders() })
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (e) {
      alert("Ошибка загрузки");
    }
    setLoading(false);
  };

  const changePlan = async (id, plan) => {
    try {
      await axios.put(`${AUTH_API}/admin/users/${id}/plan`,
        { plan },
        { headers: getHeaders() }
      );
      setUsers(users.map(u => u.id === id ? { ...u, plan } : u));
    } catch (e) {
      alert("Ошибка");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Удалить пользователя?")) return;
    try {
      await axios.delete(`${AUTH_API}/admin/users/${id}`, { headers: getHeaders() });
      setUsers(users.filter(u => u.id !== id));
    } catch (e) {
      alert("Ошибка");
    }
  };

  if (!user?.is_admin) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: "fixed", inset: 0,
        background: theme.colors.bg,
        zIndex: 3000,
        overflowY: "auto",
        padding: 32,
      }}
    >
      {/* Заголовок */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <div style={{ color: theme.colors.yellow, fontFamily: theme.fonts.mono, fontSize: 11, letterSpacing: 3, marginBottom: 8 }}>
            // ADMIN PANEL
          </div>
          <div style={{ color: theme.colors.text, fontFamily: theme.fonts.mono, fontSize: 24, fontWeight: "bold" }}>
            УПРАВЛЕНИЕ ПЛАТФОРМОЙ
          </div>
        </div>
        <motion.button
          whileHover={{ borderColor: theme.colors.red, color: theme.colors.red }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          style={{
            background: "transparent",
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.textSecondary,
            padding: "8px 20px",
            borderRadius: 6,
            cursor: "pointer",
            fontFamily: theme.fonts.mono,
            fontSize: 12,
            letterSpacing: 2,
            transition: "all 0.2s",
          }}
        >
          ✕ ЗАКРЫТЬ
        </motion.button>
      </div>

      {/* Статистика */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
          <div style={{ background: theme.colors.bgCard, border: `1px solid ${theme.colors.border}`, borderRadius: 8, padding: 20 }}>
            <div style={{ color: theme.colors.textSecondary, fontFamily: theme.fonts.mono, fontSize: 10, letterSpacing: 2, marginBottom: 8 }}>ВСЕГО ПОЛЬЗОВАТЕЛЕЙ</div>
            <div style={{ color: theme.colors.yellow, fontFamily: theme.fonts.mono, fontSize: 32, fontWeight: "bold" }}>{stats.total_users}</div>
          </div>
          {stats.by_plan?.map(p => (
            <div key={p.plan} style={{ background: theme.colors.bgCard, border: `1px solid ${theme.colors.border}`, borderRadius: 8, padding: 20 }}>
              <div style={{ color: theme.colors.textSecondary, fontFamily: theme.fonts.mono, fontSize: 10, letterSpacing: 2, marginBottom: 8 }}>
                ПЛАН {p.plan.toUpperCase()}
              </div>
              <div style={{ color: p.plan === "premium" ? theme.colors.green : p.plan === "pro" ? theme.colors.yellow : theme.colors.text, fontFamily: theme.fonts.mono, fontSize: 32, fontWeight: "bold" }}>
                {p.count}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Таблица пользователей */}
      <div style={{ background: theme.colors.bgCard, border: `1px solid ${theme.colors.border}`, borderRadius: 8, padding: 24 }}>
        <div style={{ color: theme.colors.yellow, fontFamily: theme.fonts.mono, fontSize: 11, letterSpacing: 2, marginBottom: 20 }}>
          // ПОЛЬЗОВАТЕЛИ
        </div>

        {loading ? (
          <div style={{ color: theme.colors.textSecondary, fontFamily: theme.fonts.mono }}>Загрузка...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: theme.fonts.mono, fontSize: 12 }}>
            <thead>
              <tr>
                {["ID", "USERNAME", "EMAIL", "ПЛАН", "ЗАПРОСОВ", "ДАТА", "ДЕЙСТВИЯ"].map(h => (
                  <th key={h} style={{
                    color: theme.colors.yellow, textAlign: "left",
                    padding: "8px 12px", fontSize: 10, letterSpacing: 2,
                    borderBottom: `1px solid ${theme.colors.border}`,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{ borderBottom: `1px solid ${theme.colors.border}` }}
                >
                  <td style={{ padding: "12px", color: theme.colors.textSecondary }}>{u.id}</td>
                  <td style={{ padding: "12px", color: theme.colors.yellow }}>
                    {u.username} {u.is_admin && <span style={{ color: theme.colors.green, fontSize: 10 }}>ADMIN</span>}
                  </td>
                  <td style={{ padding: "12px", color: theme.colors.text }}>{u.email}</td>
                  <td style={{ padding: "12px" }}>
                    <select
                      value={u.plan}
                      onChange={e => changePlan(u.id, e.target.value)}
                      style={{
                        background: theme.colors.bg,
                        border: `1px solid ${theme.colors.border}`,
                        color: u.plan === "premium" ? theme.colors.green : u.plan === "pro" ? theme.colors.yellow : theme.colors.text,
                        padding: "4px 8px",
                        borderRadius: 4,
                        fontFamily: theme.fonts.mono,
                        fontSize: 11,
                        cursor: "pointer",
                      }}
                    >
                      <option value="free">FREE</option>
                      <option value="pro">PRO</option>
                      <option value="premium">PREMIUM</option>
                    </select>
                  </td>
                  <td style={{ padding: "12px", color: theme.colors.text }}>{u.requests_today}</td>
                  <td style={{ padding: "12px", color: theme.colors.textSecondary }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {!u.is_admin && (
                      <motion.button
                        whileHover={{ color: theme.colors.red, borderColor: theme.colors.red }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => deleteUser(u.id)}
                        style={{
                          background: "transparent",
                          border: `1px solid ${theme.colors.border}`,
                          color: theme.colors.textSecondary,
                          padding: "4px 10px",
                          borderRadius: 4,
                          cursor: "pointer",
                          fontFamily: theme.fonts.mono,
                          fontSize: 10,
                          transition: "all 0.2s",
                        }}
                      >
                        DELETE
                      </motion.button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  );
}