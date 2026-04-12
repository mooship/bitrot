import type { DeadTech } from "../../data/types";
import { EntryCard } from "../EntryCard/EntryCard";
import styles from "./Timeline.module.css";
import { YearMarker } from "./YearMarker";

interface TimelineProps {
  entries: DeadTech[];
  onSelect: (id: string) => void;
}

export function Timeline({ entries, onSelect }: TimelineProps) {
  const years = [...new Set(entries.map((e) => e.died))].sort((a, b) => b - a);

  return (
    <section className={styles.section} aria-label="Timeline of dead technology">
      <ol className={styles.list}>
        {years.map((year) => {
          const yearEntries = entries.filter((e) => e.died === year);
          return (
            <>
              <YearMarker key={`year-${year}`} year={year} />
              {yearEntries.map((entry) => (
                <li key={entry.id} className={styles.item}>
                  <EntryCard entry={entry} onSelect={onSelect} />
                </li>
              ))}
            </>
          );
        })}
      </ol>

      {entries.length === 0 && (
        <p className={styles.empty}>No entries match the current filters.</p>
      )}
    </section>
  );
}
