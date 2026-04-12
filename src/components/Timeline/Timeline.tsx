import { Fragment, useMemo } from "react";
import type { DeadTech } from "../../data/types";
import { EntryCard } from "../EntryCard/EntryCard";
import styles from "./Timeline.module.css";
import { YearMarker } from "./YearMarker";

interface TimelineProps {
  entries: DeadTech[];
  onSelect: (id: string) => void;
}

export function Timeline({ entries, onSelect }: TimelineProps) {
  const entriesByYear = useMemo(() => {
    const years = [...new Set(entries.map((e) => e.died))].sort((a, b) => b - a);
    return years.map((year) => ({
      year,
      entries: entries.filter((e) => e.died === year),
    }));
  }, [entries]);

  return (
    <section className={styles.section} aria-label="Timeline of dead technology">
      <ol className={styles.list}>
        {entriesByYear.map(({ year, entries: yearEntries }) => (
          <Fragment key={year}>
            <YearMarker year={year} />
            {yearEntries.map((entry) => (
              <li key={entry.id} className={styles.item}>
                <EntryCard entry={entry} onSelect={onSelect} />
              </li>
            ))}
          </Fragment>
        ))}
      </ol>

      {entries.length === 0 && (
        <p className={styles.empty}>No entries match the current filters.</p>
      )}
    </section>
  );
}
