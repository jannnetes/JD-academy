import { motion } from "framer-motion";

export default function GamificationBar({ data }) {
  if (!data) return null;
  return (
    <section className="gami-bar glass">
      <div className="gami-level">
        <div className="level-ring">
          <span className="level-num">{data.level}</span>
          <span className="level-cap">level</span>
        </div>
        <div className="level-progress">
          <div className="level-progress-head">
            <span><strong>{data.xp.toLocaleString("uk-UA")}</strong> XP</span>
            <span className="muted small">to level {data.level + 1}: {Math.max(0, data.levelCeil - data.xp)} XP</span>
          </div>
          <div className="xp-track">
            <motion.div
              className="xp-fill"
              initial={{ width: 0 }}
              animate={{ width: `${data.pct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      <div className="gami-stats">
        <div className="gami-pill streak">
          <span className="gami-emoji">🔥</span>
          <div>
            <strong>{data.streak}</strong>
            <span className="muted small">day streak</span>
          </div>
        </div>
        <div className="gami-pill">
          <span className="gami-emoji">🏅</span>
          <div>
            <strong>{data.earnedCount}/{data.badgeTotal}</strong>
            <span className="muted small">badges</span>
          </div>
        </div>
        <div className="gami-pill">
          <span className="gami-emoji">🎓</span>
          <div>
            <strong>{data.certificates?.length || 0}</strong>
            <span className="muted small">certificates</span>
          </div>
        </div>
      </div>
    </section>
  );
}
