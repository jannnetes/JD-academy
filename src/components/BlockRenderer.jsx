import { useState } from "react";

function embedUrl(url = "") {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  return url;
}

function Quiz({ c }) {
  const [picked, setPicked] = useState(null);
  const [done, setDone] = useState(false);
  return (
    <div className="blk-quiz">
      <p className="blk-quiz-q">{c.question}</p>
      {c.options.map((o, i) => {
        const state = done ? (o.correct ? "correct" : i === picked ? "wrong" : "") : i === picked ? "picked" : "";
        return (
          <button key={i} className={`blk-quiz-opt ${state}`} onClick={() => !done && setPicked(i)}>
            {o.text || `Option ${i + 1}`}
          </button>
        );
      })}
      {!done ? (
        <button className="blk-quiz-submit" disabled={picked === null} onClick={() => setDone(true)}>Check answer</button>
      ) : (
        <p className="blk-quiz-result">{c.options[picked]?.correct ? "✓ Correct!" : "✗ Try again next time"}</p>
      )}
    </div>
  );
}

export default function BlockRenderer({ blocks = [] }) {
  return (
    <div className="blocks">
      {blocks.map((b) => {
        const c = typeof b.content === "string" ? JSON.parse(b.content || "{}") : b.content || {};
        switch (b.type) {
          case "text":
            return <p key={b.id} className="blk-text">{c.text}</p>;
          case "callout":
            return <div key={b.id} className={`blk-callout ${c.variant}`}>{c.text}</div>;
          case "code":
            return <pre key={b.id} className="blk-code"><code>{c.code}</code></pre>;
          case "quiz":
            return <Quiz key={b.id} c={c} />;
          case "embed":
            return <div key={b.id} className="blk-embed"><iframe src={embedUrl(c.url)} allowFullScreen title="embed" /></div>;
          case "image":
            return <img key={b.id} className="blk-image" src={c.url} alt={c.alt || ""} />;
          case "video":
            return (
              <div key={b.id} className="blk-embed">
                {/youtu/.test(c.url) ? <iframe src={embedUrl(c.url)} allowFullScreen title="video" /> : <video src={c.url} controls />}
              </div>
            );
          case "file":
            return <a key={b.id} className="blk-file" href={c.url} target="_blank" rel="noreferrer">📎 {c.name || "Download file"} →</a>;
          case "divider":
            return <hr key={b.id} className="blk-hr" />;
          default:
            return null;
        }
      })}
    </div>
  );
}
