import clsx from "clsx";
import { Shuffle } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { entries } from "../../data/entries";
import { usePourStore } from "../../stores/usePourStore";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import styles from "./Header.module.css";

export function Header() {
  const globalCount = usePourStore((s) => s.globalCount);
  const navigate = useNavigate();

  const handleRandom = () => {
    const pick = entries[Math.floor(Math.random() * entries.length)];
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
