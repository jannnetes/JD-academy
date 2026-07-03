import { useEffect, useState } from "react";
import Header from "../components/Header.jsx";

const API_URL =
  "https://script.google.com/macros/s/AKfycbyrZTnQ4aLrgcSkRw3Z6xx8HG_O9Eh-lM4xv4EUwWqbN902WfvE5C75Do2EAAZHJFdZZA/exec";

export default function Questions() {
  const [faqItems, setFaqItems] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  async function loadFaq() {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}?action=getFaq`);
      const data = await response.json();

      if (Array.isArray(data)) {
        setFaqItems(data);
      } else {
        setFaqItems([]);
      }
    } catch (error) {
      console.error("FAQ loading error:", error);
      setMessage("Failed to load FAQ. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFaq();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    const cleanQuestion = question.trim();

    if (!cleanQuestion) {
      setMessage("Please type your question.");
      return;
    }

    try {
      setSending(true);
      setMessage("");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({
          action: "addQuestion",
          question: cleanQuestion,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Send error");
      }

      setQuestion("");
      setMessage(
        "Thanks! Your question was sent. Once answered it may appear on the site."
      );
    } catch (error) {
      console.error("Question sending error:", error);
      setMessage("Failed to send the question. Check Apps Script access.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="site">
      <Header />

      <section className="page-hero">
        <span className="eyebrow">Questions & Answers</span>
        <h1>A form for parents and students.</h1>
        <p>
          Answers to common questions are published here. You can submit new
          questions via the form below.
        </p>
      </section>

      <section className="questions-table">
        <div className="table-row table-head">
          <span>Question</span>
          <span>Answer</span>
        </div>

        {loading && (
          <div className="table-empty">
            <p>Loading questions...</p>
          </div>
        )}

        {!loading && faqItems.length === 0 && (
          <div className="table-empty">
            <p>No published answers yet.</p>
          </div>
        )}

        {!loading &&
          faqItems.map((item) => (
            <div className="table-row" key={item.id || item.question}>
              <strong>{item.question}</strong>
              <p>{item.answer}</p>
            </div>
          ))}
      </section>

      <section className="ask-box">
        <div>
          <span className="eyebrow">Ask a question</span>
          <h2>Didn't find an answer?</h2>
          <p>
            Write your question. You'll see it in the Google sheet with a
            pending status. Once you answer and set the status to published, it
            appears on the site.
          </p>
        </div>

        <form className="question-form" onSubmit={handleSubmit}>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Write your question..."
            required
          />

          <button type="submit" disabled={sending}>
            {sending ? "Sending..." : "Send question"}
          </button>

          {message && <p className="form-message">{message}</p>}
        </form>
      </section>
    </main>
  );
}