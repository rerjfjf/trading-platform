import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { theme } from "../styles/theme";

export default function LangSwitch() {
  const { i18n } = useTranslation();
  const isRu = i18n.language === 'ru';

  return (
    <motion.div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        background: theme.colors.bgCard,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: 6,
        padding: "4px",
        cursor: "pointer",
        fontFamily: theme.fonts.mono,
        fontSize: 11,
      }}
    >
      {["EN", "RU"].map(lang => (
        <motion.button
          key={lang}
          whileTap={{ scale: 0.95 }}
          onClick={() => i18n.changeLanguage(lang.toLowerCase())}
          style={{
            background: i18n.language === lang.toLowerCase()
              ? theme.colors.yellow
              : "transparent",
            color: i18n.language === lang.toLowerCase()
              ? theme.colors.bg
              : theme.colors.textSecondary,
            border: "none",
            padding: "4px 10px",
            borderRadius: 4,
            cursor: "pointer",
            fontFamily: theme.fonts.mono,
            fontSize: 11,
            fontWeight: "bold",
            letterSpacing: 1,
            transition: "all 0.2s",
          }}
        >
          {lang}
        </motion.button>
      ))}
    </motion.div>
  );
}