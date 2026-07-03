import { motion } from "framer-motion";
import Sidebar from "./Sidebar.jsx";
import { useAuth } from "../auth/AuthContext.jsx";

// Typographic header per role: [filled line] + [outline line] + accent name.
const heads = {
  student: ["MY", "STUDIO"],
  teacher: ["MY", "STUDIO"],
  admin: ["CONTROL", "PANEL"],
};

export default function DashShell({ tabs, active, onTab, children }) {
  const { user } = useAuth();
  const role = user?.role || "student";
  const [l1, l2] = heads[role];
  const crumb = tabs.find((t) => t.id === active)?.label || "";
  const today = new Date().toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className={`dash dash-${role}`}>
      <Sidebar tabs={tabs} active={active} onTab={onTab} />

      <main className="dash-main">
        <div className="dash-head">
          <span className="dash-crumb">DASHBOARD / {crumb.toUpperCase()}</span>
          <div className="dash-head-row">
            <h1 className="dash-title">
              <span className="filled">{l1}</span>
              <span className="outline">{l2}</span>
              <i className="accent">, {user?.name?.split(" ")[0]}</i>
            </h1>
            <span className="dash-date">{today}</span>
          </div>
          <div className="dash-rule" />
        </div>

        <motion.div key={active} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          {children}
        </motion.div>
      </main>
    </div>
  );
}
