import clsx from "clsx";
import { Search, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { entries } from "../../data/entries";
import { CATEGORY_LABELS, CAUSE_LABELS, CAUSES_OF_DEATH, TECH_CATEGORIES } from "../../data/types";
import type { SortOrder } from "../../stores/useFilterStore";
import { useFilteredEntries, useFilterStore } from "../../stores/useFilterStore";
import styles from "./FilterBar.module.css";

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "died", label: "Year" },
  { value: "lifespan", label: "Lifespan" },
  { value: "name", label: "Name" },
];

export function FilterBar() {
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    activeCauses,
    activeCategories,
    searchQuery,
    sortOrder,
    toggleCause,
    toggleCategory,
    setSearchQuery,
    setSortOrder,
    clearAll,
  } = useFilterStore();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "/") {
        return;
      }
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        target.closest('[role="dialog"]') !== null
      ) {
        return;
      }
      e.preventDefault();
      inputRef.current?.focus();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const hasFilters =
    activeCauses.size > 0 || activeCategories.size > 0 || searchQuery.trim().length > 0;
  const filteredCount = useFilteredEntries().length;

  return (
    <search className={styles.filterBar} aria-label="Filter entries">
      <div className={styles.inner}>
        <div className={styles.searchRow}>
          <label className={styles.searchField}>
            <span className={styles.visuallyHidden}>Search dead tech</span>
            <span className={styles.searchInputWrap}>
              <Search size={16} aria-hidden="true" className={styles.searchIcon} />
              <input
                ref={inputRef}
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
            </span>
          </label>

          <p className={styles.status} aria-live="polite" aria-atomic="true">
            {filteredCount === entries.length
              ? `${entries.length} entries`
              : `Showing ${filteredCount} of ${entries.length} entries`}
          </p>
        </div>

        <div className={styles.filtersRow}>
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

            <fieldset className={styles.group}>
              <legend className={styles.groupLabel}>Sort</legend>
              <div className={styles.chips}>
                {SORT_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    className={clsx(styles.chip, sortOrder === value && styles.chipActive)}
                    aria-pressed={sortOrder === value}
                    onClick={() => setSortOrder(value)}
                  >
                    {label}
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
      </div>
    </search>
  );
}
