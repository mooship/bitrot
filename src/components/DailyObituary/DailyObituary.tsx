import { Link } from "react-router-dom";
import { entries } from "../../data/entries";
import { CAUSE_LABELS } from "../../data/types";
import { useEntryAccent } from "../../hooks/useEntryAccent";
import { hasActiveFilters, useFilterStore } from "../../stores/useFilterStore";
import { getDailyEntry } from "../../utils/daily";
import styles from "./DailyObituary.module.css";

export function DailyObituary() {
  const state = useFilterStore();
  const filtersActive = hasActiveFilters(state);
  const entry = getDailyEntry(entries);
  const accentStyle = useEntryAccent(entry?.brandColor);

  if (!entry || filtersActive) {
    return null;
  }

  return (
    <aside className={styles.banner} aria-label="Today's moment of silence" style={accentStyle}>
      <div className={styles.bar} aria-hidden="true" />
      <div className={styles.content}>
        <p className={styles.eyebrow}>Today's moment of silence</p>
        <Link to={`/entry/${entry.id}`} className={styles.link}>
          <span className={styles.name}>{entry.name}</span>
          <span className={styles.tagline}>{entry.tagline}</span>
        </Link>
        <p className={styles.meta}>
          <span className={styles.dates}>
            {entry.born}–{entry.died}
          </span>
          <span className={styles.dot} aria-hidden="true">
            ·
          </span>
          <span className={styles.cause}>{CAUSE_LABELS[entry.causeOfDeath]}</span>
        </p>
      </div>
    </aside>
  );
}
