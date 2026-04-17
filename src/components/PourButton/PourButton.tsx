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
  const isPending = usePourStore((s) => s.pendingPours.has(entryId));
  const isLoading = usePourStore((s) => s.loading);
  const hasCount = usePourStore((s) => entryId in s.counts);
  const pour = usePourStore((s) => s.pour);

  function handlePour() {
    if (alreadyPoured || isPending) {
      return;
    }
    pour(entryId);
  }

  function getLabel() {
    if (isPending) {
      return "Pouring…";
    }
    if (alreadyPoured) {
      return "Poured";
    }
    return "Pour one out";
  }

  const showPlaceholder = isLoading && !hasCount;

  function renderCount() {
    if (showPlaceholder) {
      return (
        <span className={styles.placeholder} aria-hidden="true">
          —
        </span>
      );
    }
    return count > 0 ? count.toLocaleString() : "";
  }

  return (
    <button
      type="button"
      className={clsx(styles.button, alreadyPoured && styles.poured)}
      onClick={handlePour}
      disabled={alreadyPoured || isPending}
      aria-label={`Pour one out for ${entryName}. Current count: ${count}`}
      aria-busy={isPending || showPlaceholder}
    >
      <span className={styles.glass} aria-hidden="true">
        <span className={styles.liquid} />
      </span>
      <span className={styles.label}>{getLabel()}</span>
      <span className={styles.count} aria-live="polite" aria-atomic="true">
        {renderCount()}
      </span>
    </button>
  );
}
