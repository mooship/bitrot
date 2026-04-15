import { Fragment, useMemo } from "react";
import type { DeadTech } from "../../data/types";
import type { SortOrder } from "../../stores/useFilterStore";
import { EntryCard } from "../EntryCard/EntryCard";
import styles from "./Timeline.module.css";
import { YearMarker } from "./YearMarker";

interface TimelineProps {
  entries: DeadTech[];
  sortOrder: SortOrder;
  onSelect: (id: string) => void;
}

export function Timeline({ entries, sortOrder, onSelect }: TimelineProps) {
  const entriesByYear = useMemo(() => {
    if (sortOrder !== "died") {
      return null;
    }
    const map = new Map<number, DeadTech[]>();
    for (const entry of entries) {
      let group = map.get(entry.died);
      if (!group) {
        group = [];
        map.set(entry.died, group);
      }
      group.push(entry);
    }
    return Array.from(map, ([year, items]) => ({ year, entries: items })).sort(
      (a, b) => b.year - a.year
    );
  }, [entries, sortOrder]);

  return (
    <section className={styles.section} aria-label="Timeline of dead technology">
      <ol className={styles.list}>
        {entriesByYear
          ? entriesByYear.map(({ year, entries: yearEntries }) => (
              <Fragment key={year}>
                <YearMarker year={year} />
                {yearEntries.map((entry) => (
                  <li key={entry.id} className={styles.item}>
                    <EntryCard entry={entry} onSelect={onSelect} />
                  </li>
                ))}
              </Fragment>
            ))
          : entries.map((entry) => (
              <li key={entry.id} className={styles.item}>
                <EntryCard entry={entry} onSelect={onSelect} />
              </li>
            ))}
      </ol>

      {entries.length === 0 && (
        <p className={styles.empty}>No entries match the current filters.</p>
      )}
    </section>
  );
}
