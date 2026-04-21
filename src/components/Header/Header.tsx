import clsx from "clsx";
import { Shuffle } from "lucide-react";
import { useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { entries } from "../../data/entries";
import { usePourStore } from "../../stores/usePourStore";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import styles from "./Header.module.css";

const RECENT_PICK_LIMIT = 3;

function currentEntryId(pathname: string): string | null {
  const match = pathname.match(/^\/entry\/([^/]+)/);
  return match ? match[1] : null;
}

export function Header() {
  const globalCount = usePourStore((s) => s.globalCount);
  const navigate = useNavigate();
  const location = useLocation();
  const recentPicks = useRef<string[]>([]);

  const handleRandom = () => {
    if (entries.length === 0) {
      return;
    }
    const currentId = currentEntryId(location.pathname);
    const avoid = new Set([...recentPicks.current]);
    if (currentId) {
      avoid.add(currentId);
    }
    const candidates = entries.filter((e) => !avoid.has(e.id));
    const pool = candidates.length > 0 ? candidates : entries.filter((e) => e.id !== currentId);
    const source = pool.length > 0 ? pool : entries;
    const pick = source[Math.floor(Math.random() * source.length)];
    recentPicks.current = [pick.id, ...recentPicks.current].slice(0, RECENT_PICK_LIMIT);
    navigate(`/entry/${pick.id}`);
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brandLink}>
          <h1 className={styles.title}>Bitrot</h1>
          <p className={styles.subtitle}>An interactive memorial for dead technology</p>
        </Link>
        <div className={styles.actions}>
          <nav aria-label="Main">
            <NavLink
              to="/stats"
              className={({ isActive }) => clsx(styles.navLink, isActive && styles.navLinkActive)}
            >
              Stats
            </NavLink>
          </nav>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={handleRandom}
            aria-label="Open a random entry"
            title="Open a random entry (r)"
          >
            <Shuffle size={18} aria-hidden="true" />
          </button>
          <ThemeToggle />
        </div>
        {globalCount > 0 && (
          <p className={styles.globalCount} aria-live="polite">
            <span className={styles.countNumber}>{globalCount.toLocaleString()}</span>
            <span className={styles.countLabel}>
              {globalCount === 1 ? "moment of silence" : "moments of silence"} observed
            </span>
          </p>
        )}
      </div>
    </header>
  );
}
