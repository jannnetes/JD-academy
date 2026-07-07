import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);

  function load() {
    api("/me/notifications").then((d) => {
      setItems(d.notifications);
      setUnreadCount(d.unreadCount);
    }).catch(() => {});
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  async function markAllRead() {
    await api("/me/notifications/read-all", { method: "PATCH" });
    load();
  }
  async function openItem(n) {
    if (!n.read) await api(`/me/notifications/${n.id}/read`, { method: "PATCH" });
    setOpen(false);
    load();
  }

  return (
    <div className="notif-bell" ref={ref}>
      <button className="notif-bell-btn" onClick={() => setOpen((v) => !v)} aria-label="Notifications">
        🔔
        {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>
      {open && (
        <div className="notif-menu">
          <div className="notif-menu-head">
            <span>Notifications</span>
            {unreadCount > 0 && <button onClick={markAllRead}>Mark all read</button>}
          </div>
          {items.length === 0 && <p className="notif-empty">Nothing yet.</p>}
          {items.map((n) => (
            <Link
              key={n.id}
              to={n.link || "#"}
              className={`notif-item ${n.read ? "" : "unread"}`}
              onClick={() => openItem(n)}
            >
              <strong>{n.title}</strong>
              <p>{n.body}</p>
              <span className="notif-time">{timeAgo(n.createdAt)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
