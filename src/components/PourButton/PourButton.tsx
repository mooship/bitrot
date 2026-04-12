import clsx from "clsx";
import { useState } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { usePourStore } from "../../stores/usePourStore";
import styles from "./PourButton.module.css";

interface PourButtonProps {
  entryId: string;
  entryName: string;
}

export function PourButton({ entryId, entryName }: PourButtonProps) {
  const { counts, pouredThisSession, pour } = usePourStore();
  const reducedMotion = useReducedMotion();
  const [isAnimating, setIsAnimating] = useState(false);

  const count = counts[entryId] ?? 0;
  const alreadyPoured = pouredThisSession.has(entryId);

  function handlePour() {
    if (alreadyPoured) {
      return;
    }
    pour(entryId).catch(() => setIsAnimating(false));
    if (!reducedMotion) {
      setIsAnimating(true);
    }
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
        <span className={clsx(styles.glass, isAnimating && styles.pouring)} aria-hidden="true">
          <span className={styles.liquid} onAnimationEnd={() => setIsAnimating(false)} />
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
