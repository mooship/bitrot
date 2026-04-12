import { usePourStore } from "../../stores/usePourStore";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import styles from "./Header.module.css";

export function Header() {
  const globalCount = usePourStore((s) => s.globalCount);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <h1 className={styles.title}>Bitrot</h1>
          <p className={styles.subtitle}>An interactive memorial for dead technology</p>
        </div>
        <div className={styles.actions}>
          {globalCount > 0 && (
            <p className={styles.globalCount} aria-live="polite">
              <span className={styles.countNumber}>{globalCount.toLocaleString()}</span>
              <span className={styles.countLabel}>
                {globalCount === 1 ? "moment of silence" : "moments of silence"} observed
              </span>
            </p>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
