import { AnimatePresence, motion } from "framer-motion";

export default function XpToast({ toast }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          className="xp-toast"
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {toast.xp > 0 && <span className="xp-toast-xp">+{toast.xp} XP ⚡</span>}
          {toast.leveledUp && <span className="xp-toast-line">🎉 Level up!</span>}
          {toast.badges?.map((b) => (
            <span key={b.code} className="xp-toast-line">{b.icon} Badge "{b.title}"</span>
          ))}
          {toast.certificate && <span className="xp-toast-line">🎓 Course complete — certificate!</span>}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
