import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import { api } from "../api";
import { categoryForIndustry } from "../categories";

const tabs = [
  { id: "now", label: "LIVE NOW" },
  { id: "schedule", label: "SCHEDULE" },
];

export default function Live() {
  const [sessions, setSessions] = useState([]);
  const [tab, setTab] = useState("now");

  useEffect(() => { api("/live").then(setSessions).catch(() => {}); }, []);

  const now = sessions.filter((s) => s.status === "live");
  const upcoming = sessions.filter((s) => s.status !== "live");

  return (
    <div className="bold bs-page">
      <Header />
      <section className="bs bs-coral">
        <div className="bw">
          <h1 className="bs-live-title">
            <span className="line outline-w">LIVE</span>
            <span className="line filled-w">LESSONS</span>
          </h1>
          <div className="bs-live-badge"><span className="bs-live-dot" />LIVE NOW: {now.length} {now.length === 1 ? "session" : "sessions"}</div>

          <div className="live-tabs">
            {tabs.map((t) => (
              <button key={t.id} className={tab === t.id ? "live-tab on" : "live-tab"} onClick={() => setTab(t.id)} data-cursor="PICK">{t.label}</button>
            ))}
          </div>

          {tab === "now" && (
            <div className="cat-grid" style={{ marginTop: 30 }}>
              {now.length === 0 && <p className="mono">No active broadcasts right now. Check the schedule →</p>}
              {now.map((s) => (
                <div className="bs-card" key={s.id} style={{ background: "#0A0A0A", color: "#fff" }}>
                  <div className="bs-card-top"><span className="bs-card-tag" style={{ color: "#FF3D2E" }}>🔴 LIVE</span><span className="mono">{s.booked} online</span></div>
                  <h3 className="bs-card-title">{s.title}</h3>
                  <div className="bs-card-meta"><span>{s.teacher?.name}</span></div>
                  <div className="bs-card-foot"><span className="mono">{s.provider}</span><a href={s.roomUrl} target="_blank" rel="noreferrer" className="bs-card-buy">JOIN →</a></div>
                </div>
              ))}
            </div>
          )}

          {tab === "schedule" && (
            <div className="live-table">
              <div className="live-row live-head">
                <span>TIME</span><span>TITLE</span><span>TEACHER</span><span>PRICE</span><span></span>
              </div>
              {upcoming.map((s) => {
                const cat = categoryForIndustry(s.course?.industry);
                return (
                  <div className="live-row" key={s.id}>
                    <span className="mono">{new Date(s.startsAt).toLocaleString("en-US", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                    <span className="live-name">{cat?.icon} {s.title}</span>
                    <span>{s.teacher?.name}</span>
                    <span>{s.price > 0 ? `$${s.price}` : "Free"}</span>
                    <Link to="/dashboard" className="bs-card-buy">BOOK →</Link>
                  </div>
                );
              })}
              {upcoming.length === 0 && <p className="mono" style={{ padding: 20 }}>Schedule updating…</p>}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
