import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";

const BLOCK_TYPES = [
  { type: "text", icon: "📝", label: "Text" },
  { type: "callout", icon: "✦", label: "Callout" },
  { type: "code", icon: "💻", label: "Code" },
  { type: "quiz", icon: "❓", label: "Quiz" },
  { type: "embed", icon: "🔗", label: "Embed" },
  { type: "image", icon: "🖼", label: "Image (URL)" },
  { type: "video", icon: "🎥", label: "Video (URL)" },
  { type: "file", icon: "📎", label: "File (URL)" },
  { type: "divider", icon: "—", label: "Divider" },
];

const emptyContent = {
  text: { text: "" },
  callout: { variant: "info", text: "" },
  code: { lang: "js", code: "" },
  quiz: { question: "", options: [{ text: "", correct: true }, { text: "", correct: false }] },
  embed: { url: "" },
  image: { url: "", alt: "" },
  video: { url: "" },
  file: { url: "", name: "" },
  divider: {},
};

export default function Builder() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [save, setSave] = useState("");        // "", "saving", "saved"
  const [addOpen, setAddOpen] = useState(false);
  const skipSave = useRef(true);

  async function loadCourse() {
    const c = await api(`/courses/${courseId}`);
    setCourse(c);
    return c;
  }
  useEffect(() => { loadCourse(); }, [courseId]);

  async function openLesson(l) {
    skipSave.current = true;
    setActiveLesson(l);
    const b = await api(`/courses/lessons/${l.id}/blocks`);
    setBlocks(b);
    setTimeout(() => { skipSave.current = false; }, 50);
  }

  // debounced autosave
  const saveBlocks = useCallback(async (lessonId, data) => {
    setSave("saving");
    try {
      await api(`/courses/lessons/${lessonId}/blocks`, { method: "PUT", body: { blocks: data } });
      setSave("saved");
      setTimeout(() => setSave(""), 1500);
    } catch {
      setSave("");
    }
  }, []);

  useEffect(() => {
    if (skipSave.current || !activeLesson) return;
    const id = setTimeout(() => saveBlocks(activeLesson.id, blocks), 1100);
    return () => clearTimeout(id);
  }, [blocks, activeLesson, saveBlocks]);

  function addBlock(type) {
    setBlocks([...blocks, { id: `tmp-${Date.now()}`, type, content: JSON.parse(JSON.stringify(emptyContent[type])) }]);
    setAddOpen(false);
  }
  function update(i, content) {
    setBlocks(blocks.map((b, idx) => (idx === i ? { ...b, content } : b)));
  }
  function remove(i) { setBlocks(blocks.filter((_, idx) => idx !== i)); }
  function move(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[j]] = [next[j], next[i]];
    setBlocks(next);
  }

  async function addModule() {
    const title = prompt("Module title:");
    if (!title) return;
    await api(`/courses/${courseId}/modules`, { method: "POST", body: { title } });
    loadCourse();
  }
  async function addLesson(moduleId) {
    const title = prompt("Lesson title:");
    if (!title) return;
    await api(`/courses/${courseId}/modules/${moduleId}/lessons`, { method: "POST", body: { title } });
    loadCourse();
  }

  if (!course) return <div className="bld"><p className="mono" style={{ padding: 40 }}>Loading…</p></div>;

  return (
    <div className="bld">
      {/* LEFT — structure */}
      <aside className="bld-side">
        <Link to="/dashboard" className="bld-back">← Dashboard</Link>
        <h2 className="bld-course-title">{course.title}</h2>
        {course.modules.map((m) => (
          <div key={m.id} className="bld-mod">
            <p className="bld-mod-title">{m.title}</p>
            {m.lessons.map((l) => (
              <button key={l.id} className={`bld-lesson ${activeLesson?.id === l.id ? "on" : ""}`} onClick={() => openLesson(l)}>
                ▶ {l.title}
              </button>
            ))}
            <button className="bld-add" onClick={() => addLesson(m.id)}>+ Lesson</button>
          </div>
        ))}
        <button className="bld-add-mod" onClick={addModule}>+ Add module</button>
      </aside>

      {/* CENTER — editor */}
      <main className="bld-main">
        {!activeLesson ? (
          <div className="bld-empty"><p className="mono">Select a lesson on the left, or add one.</p></div>
        ) : (
          <>
            <div className="bld-head">
              <h1>{activeLesson.title}</h1>
              <span className={`bld-save ${save}`}>{save === "saving" ? "SAVING…" : save === "saved" ? "SAVED ✓" : ""}</span>
            </div>

            {blocks.map((b, i) => (
              <div key={b.id} className="bld-block">
                <div className="bld-block-bar">
                  <span className="bld-block-type">{b.type}</span>
                  <div className="bld-block-ctrl">
                    <button onClick={() => move(i, -1)}>↑</button>
                    <button onClick={() => move(i, 1)}>↓</button>
                    <button onClick={() => remove(i)}>✕</button>
                  </div>
                </div>
                <BlockEditor block={b} onChange={(c) => update(i, c)} />
              </div>
            ))}

            <div className="bld-addwrap">
              <button className="bld-plus" onClick={() => setAddOpen(!addOpen)}>+ Add block</button>
              {addOpen && (
                <div className="bld-menu">
                  {BLOCK_TYPES.map((t) => (
                    <button key={t.type} onClick={() => addBlock(t.type)}>{t.icon} {t.label}</button>
                  ))}
                </div>
              )}
            </div>

            <Link to={`/learn/${courseId}`} className="bld-preview" target="_blank">PREVIEW (student view) →</Link>
          </>
        )}
      </main>
    </div>
  );
}

function BlockEditor({ block, onChange }) {
  const c = block.content;
  switch (block.type) {
    case "text":
      return <textarea className="bld-input area" placeholder="Write text…" value={c.text} onChange={(e) => onChange({ text: e.target.value })} />;
    case "callout":
      return (
        <div>
          <div className="bld-row">
            {["info", "warning", "success", "error"].map((v) => (
              <button key={v} className={`bld-chip ${c.variant === v ? "on" : ""}`} onClick={() => onChange({ ...c, variant: v })}>{v}</button>
            ))}
          </div>
          <textarea className="bld-input area" placeholder="Callout text…" value={c.text} onChange={(e) => onChange({ ...c, text: e.target.value })} />
        </div>
      );
    case "code":
      return (
        <div>
          <input className="bld-input" placeholder="language (js, py…)" value={c.lang} onChange={(e) => onChange({ ...c, lang: e.target.value })} />
          <textarea className="bld-input area mono" placeholder="code…" value={c.code} onChange={(e) => onChange({ ...c, code: e.target.value })} />
        </div>
      );
    case "quiz":
      return (
        <div>
          <textarea className="bld-input area" placeholder="Question…" value={c.question} onChange={(e) => onChange({ ...c, question: e.target.value })} />
          {c.options.map((o, i) => (
            <div className="bld-row" key={i}>
              <input type="radio" checked={o.correct} onChange={() => onChange({ ...c, options: c.options.map((x, j) => ({ ...x, correct: j === i })) })} />
              <input className="bld-input" placeholder={`Option ${i + 1}`} value={o.text} onChange={(e) => onChange({ ...c, options: c.options.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)) })} />
              <button className="bld-chip" onClick={() => onChange({ ...c, options: c.options.filter((_, j) => j !== i) })}>✕</button>
            </div>
          ))}
          <button className="bld-chip" onClick={() => onChange({ ...c, options: [...c.options, { text: "", correct: false }] })}>+ Option</button>
        </div>
      );
    case "embed":
      return <input className="bld-input" placeholder="YouTube / Figma / URL…" value={c.url} onChange={(e) => onChange({ url: e.target.value })} />;
    case "image":
      return (
        <div>
          <input className="bld-input" placeholder="Image URL…" value={c.url} onChange={(e) => onChange({ ...c, url: e.target.value })} />
          <input className="bld-input" placeholder="Alt text" value={c.alt} onChange={(e) => onChange({ ...c, alt: e.target.value })} />
        </div>
      );
    case "video":
      return <input className="bld-input" placeholder="Video URL (mp4 / YouTube)…" value={c.url} onChange={(e) => onChange({ url: e.target.value })} />;
    case "file":
      return (
        <div>
          <input className="bld-input" placeholder="File URL…" value={c.url} onChange={(e) => onChange({ ...c, url: e.target.value })} />
          <input className="bld-input" placeholder="File name" value={c.name} onChange={(e) => onChange({ ...c, name: e.target.value })} />
        </div>
      );
    case "divider":
      return <hr className="bld-divider" />;
    default:
      return null;
  }
}
