import clsx from "clsx";
import { Search, X } from "lucide-react";
import { entries } from "../../data/entries";
import { CATEGORY_LABELS, CAUSE_LABELS, CAUSES_OF_DEATH, TECH_CATEGORIES } from "../../data/types";
import { useFilteredEntries, useFilterStore } from "../../stores/useFilterStore";
import styles from "./FilterBar.module.css";

export function FilterBar() {
  const {
    activeCauses,
    activeCategories,
    searchQuery,
    toggleCause,
    toggleCategory,
    setSearchQuery,
    clearAll,
  } = useFilterStore();

  const hasFilters =
    activeCauses.size > 0 || activeCategories.size > 0 || searchQuery.trim().length > 0;
  const filteredCount = useFilteredEntries().length;

  return (
    <search className={styles.filterBar} aria-label="Filter entries">
      <div className={styles.inner}>
        <label className={styles.searchField}>
          <Search size={16} aria-hidden="true" className={styles.searchIcon} />
          <span className={styles.visuallyHidden}>Search dead tech</span>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search dead tech…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
            spellCheck="false"
          />
          {searchQuery.length > 0 && (
            <button
              type="button"
              className={styles.searchClear}
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </label>

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
