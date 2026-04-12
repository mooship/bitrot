import clsx from "clsx";
import { usePourStore } from "../../stores/usePourStore";
import styles from "./PourButton.module.css";

interface PourButtonProps {
  entryId: string;
  entryName: string;
}

export function PourButton({ entryId, entryName }: PourButtonProps) {
  const count = usePourStore((s) => s.counts[entryId] ?? 0);
  const alreadyPoured = usePourStore((s) => s.pouredThisSession.has(entryId));
  const pour = usePourStore((s) => s.pour);

  function handlePour() {
    if (alreadyPoured) {
      return;
    }
    pour(entryId);
  }

  return (
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
      {count > 0 && (
        <span className={styles.count} aria-live="polite" aria-atomic="true">
          {count.toLocaleString()}
        </span>
      )}
    </button>
  );
}
