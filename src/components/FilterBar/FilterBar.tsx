import clsx from "clsx";
import { entries } from "../../data/entries";
import { CATEGORY_LABELS, CAUSE_LABELS, CAUSES_OF_DEATH, TECH_CATEGORIES } from "../../data/types";
import { useFilteredEntries, useFilterStore } from "../../stores/useFilterStore";
import styles from "./FilterBar.module.css";

export function FilterBar() {
  const { activeCauses, activeCategories, toggleCause, toggleCategory, clearAll } =
    useFilterStore();

  const hasFilters = activeCauses.size > 0 || activeCategories.size > 0;
  const filteredCount = useFilteredEntries().length;

  return (
    <search className={styles.filterBar} aria-label="Filter entries">
      <div className={styles.inner}>
        <div className={styles.groups}>
          <fieldset className={styles.group}>
            <legend className={styles.groupLabel}>Cause</legend>
            <div className={styles.chips}>
              {CAUSES_OF_DEATH.map((cause) => (
                <button
                  key={cause}
                  type="button"
                  className={clsx(styles.chip, activeCauses.has(cause) && styles.chipActive)}
                  aria-pressed={activeCauses.has(cause)}
                  onClick={() => toggleCause(cause)}
                >
                  {CAUSE_LABELS[cause]}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.group}>
            <legend className={styles.groupLabel}>Category</legend>
            <div className={styles.chips}>
              {TECH_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={clsx(styles.chip, activeCategories.has(cat) && styles.chipActive)}
                  aria-pressed={activeCategories.has(cat)}
                  onClick={() => toggleCategory(cat)}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        {hasFilters && (
          <div className={styles.actions}>
            <button type="button" className={styles.clearBtn} onClick={clearAll}>
              Clear filters
            </button>
          </div>
        )}
      </div>

      <p className={styles.status} aria-live="polite" aria-atomic="true">
        {hasFilters
          ? `Showing ${filteredCount} of ${entries.length} entries`
          : `${entries.length} entries`}
      </p>
    </search>
  );
}
