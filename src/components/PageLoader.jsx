import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const WORD = "JD LEARN".split("");

// Letters fly in from chaos, assemble, then the panel slides up and unmounts.
export default function PageLoader() {
  const [up, setUp] = useState(false);       // slide panel away
  const [removed, setRemoved] = useState(false); // unmount entirely

  useEffect(() => {
    const t1 = setTimeout(() => setUp(true), 1700);
    const t2 = setTimeout(() => setRemoved(true), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (removed) return null;

  return (
    <motion.div
      className="loader"
      initial={{ y: 0 }}
      animate={{ y: up ? "-100%" : 0 }}
      transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="loader-word">
        {WORD.map((ch, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: (i % 2 ? 1 : -1) * 80, rotate: (i - 4) * 12, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, rotate: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            {ch === " " ? " " : ch}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}
