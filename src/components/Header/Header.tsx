import clsx from "clsx";
import { Shuffle } from "lucide-react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import { entries } from "../../data/entries";
import { usePourStore } from "../../stores/usePourStore";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import styles from "./Header.module.css";

function pickRandomEntryId(currentId: string | undefined): string {
  if (entries.length === 0) {
    return "";
  }
  if (entries.length === 1) {
    return entries[0].id;
  }
  let pick = entries[Math.floor(Math.random() * entries.length)];
  if (currentId && pick.id === currentId) {
    pick = entries[Math.floor(Math.random() * entries.length)];
  }
  return pick.id;
}

export function Header() {
  const globalCount = usePourStore((s) => s.globalCount);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const handleRandom = () => {
    const next = pickRandomEntryId(id);
    if (next) {
      navigate(`/entry/${next}`);
    }
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
