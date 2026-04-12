import clsx from "clsx";
import { usePourStore } from "../../stores/usePourStore";
import styles from "./PourButton.module.css";

interface PourButtonProps {
  entryId: string;
  entryName: string;
}

export function PourButton({ entryId, entryName }: PourButtonProps) {
  const { counts, pouredThisSession, pour } = usePourStore();

  const count = counts[entryId] ?? 0;
  const alreadyPoured = pouredThisSession.has(entryId);

  function handlePour() {
    if (alreadyPoured) {
      return;
    }
    pour(entryId);
  }

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={clsx(styles.button, alreadyPoured && styles.poured)}
        onClick={handlePour}
        disabled={alreadyPoured}
        aria-label={`Pour one out for ${entryName}. Current count: ${count}`}
      >
        <span className={styles.glass} aria-hidden="true">
          <span className={styles.liquid} />
        </span>
        <span className={styles.label}>{alreadyPoured ? "Poured" : "Pour one out"}</span>
      </button>
      <p className={styles.count} aria-live="polite" aria-atomic="true">
        <span className={styles.countNum}>{count.toLocaleString()}</span>
        <span className={styles.countWord}>{count === 1 ? "pour" : "pours"}</span>
      </p>
    </div>
  );
}
