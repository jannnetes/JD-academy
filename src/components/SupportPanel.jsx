import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL =
  "https://script.google.com/macros/s/AKfycbyrZTnQ4aLrgcSkRw3Z6xx8HG_O9Eh-lM4xv4EUwWqbN902WfvE5C75Do2EAAZHJFdZZA/exec";

// FAQ + ask-a-question + quick communication, lives inside the student cabinet.
export default function SupportPanel() {
  const [faq, setFaq] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}?action=getFaq`);
        const data = await res.json();
        setFaq(Array.isArray(data) ? data : []);
      } catch {
        setFaq([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function submit(e) {
    e.preventDefault();
    const clean = question.trim();
    if (!clean) return setMessage("Please type your question.");
    try {
      setSending(true);
      setMessage("");
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "addQuestion", question: clean }),
      });
      const r = await res.json();
      if (!r.success) throw new Error(r.error || "Error");
      setQuestion("");
      setMessage("✓ Question sent! The answer will appear here after review.");
    } catch {
      setMessage("Could not send. Please try again later.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="support-wrap">
      <section className="support-faq glass">
        <span className="eyebrow">FAQ</span>
        <h3>Answers to popular questions</h3>

        {loading && <p className="muted small">Loading...</p>}
        {!loading && faq.length === 0 && (
          <p className="muted small">No published answers yet.</p>
        )}

        <div className="faq-accordion">
          {faq.map((item, i) => {
            const id = item.id || i;
            const open = openId === id;
            return (
              <div key={id} className={`faq-item ${open ? "open" : ""}`}>
                <button className="faq-q" onClick={() => setOpenId(open ? null : id)}>
                  <span>{item.question}</span>
                  <span className="faq-toggle">{open ? "−" : "+"}</span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      className="faq-a"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p>{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      <aside className="support-side">
        <section className="ask-card glass">
          <span className="eyebrow">Ask a question</span>
          <h3>Didn't find an answer?</h3>
          <form onSubmit={submit} className="auth-form">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Write your question to a teacher or support..."
            />
            <button className="primary-btn full" disabled={sending}>
              {sending ? "Sending..." : "Send question"}
            </button>
            {message && <p className="form-message">{message}</p>}
          </form>
        </section>

        <section className="contact-card glass">
          <h3>💬 Quick contact</h3>
          <p className="muted small">We reply within a day.</p>
          <div className="contact-links">
            <a href="https://t.me/" target="_blank" rel="noreferrer" className="contact-link">
              <span>✈️</span> Telegram
            </a>
            <a href="mailto:support@jdlearn.com" className="contact-link">
              <span>✉️</span> Email
            </a>
            <a href="#" className="contact-link"><span>📞</span> Request a call</a>
          </div>
        </section>
      </aside>
    </div>
  );
}
