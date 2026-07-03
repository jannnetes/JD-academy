import { useEffect, useRef, useState } from "react";

const CHARS = "ABCD@#%&XZ01—/KURSL mnoΔΣ";

// Reveals text by "scrambling" letters into place once it scrolls into view.
export default function ScrambleText({ text, className = "", as: Tag = "span" }) {
  const ref = useRef(null);
  const [out, setOut] = useState(text);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let started = false;
    const run = () => {
      let frame = 0;
      const total = 18;
      const id = setInterval(() => {
        frame++;
        const revealed = Math.floor((frame / total) * text.length);
        setOut(
          text
            .split("")
            .map((ch, i) => {
              if (ch === " ") return " ";
              if (i < revealed) return ch;
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join("")
        );
        if (frame >= total) {
          clearInterval(id);
          setOut(text);
        }
      }, 45);
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          started = true;
          run();
        }
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [text]);

  return (
    <Tag ref={ref} className={className}>
      {out}
    </Tag>
  );
}
