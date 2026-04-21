import clsx from "clsx";
import { ArrowDown, ArrowUp, Search, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { entries } from "../../data/entries";
import { CATEGORY_LABELS, CAUSE_LABELS, CAUSES_OF_DEATH, TECH_CATEGORIES } from "../../data/types";
import {
  hasActiveFilters,
  MAX_ENTRY_YEAR,
  MIN_ENTRY_YEAR,
  type SortOrder,
  useFilteredEntries,
  useFilterStore,
} from "../../stores/useFilterStore";
import { isEditableTarget, isInDialog } from "../../utils/dom";
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
    sortDirection,
    fromYear,
    toYear,
    toggleCause,
    toggleCategory,
    setSearchQuery,
    setSortOrder,
    toggleSortDirection,
    setYearRange,
    clearAll,
  } = useFilterStore();

  const hasFilters = hasActiveFilters({
    activeCauses,
    activeCategories,
    searchQuery,
    fromYear,
    toYear,
  });

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "/") {
        if (isEditableTarget(e.target) || isInDialog(e.target)) {
          return;
        }
        e.preventDefault();
        inputRef.current?.focus();
        return;
      }

      if (e.key === "Escape") {
        if (isInDialog(e.target)) {
          return;
        }
        const state = useFilterStore.getState();
        if (!hasActiveFilters(state)) {
          return;
        }
        e.preventDefault();
        state.clearAll();
        if (e.target === inputRef.current) {
          inputRef.current?.blur();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const filteredCount = useFilteredEntries().length;

  const handleSortClick = (value: SortOrder) => {
    if (sortOrder === value) {
      toggleSortDirection();
      return;
    }
    setSortOrder(value);
  };

  const handleYearChange = (field: "from" | "to", raw: string) => {
    const value = raw.trim();
    const parsed = value === "" ? null : Number.parseInt(value, 10);
    const normalized = parsed != null && Number.isFinite(parsed) ? parsed : null;
    if (field === "from") {
      setYearRange(normalized, toYear);
    } else {
      setYearRange(fromYear, normalized);
    }
  };

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
                {SORT_OPTIONS.map(({ value, label }) => {
                  const isActive = sortOrder === value;
                  const ariaLabel = isActive
                    ? `Sort by ${label}, ${sortDirection === "asc" ? "ascending" : "descending"}. Click to reverse.`
                    : `Sort by ${label}`;
                  return (
                    <button
                      key={value}
                      type="button"
                      className={clsx(styles.chip, isActive && styles.chipActive)}
                      aria-pressed={isActive}
                      aria-label={ariaLabel}
                      onClick={() => handleSortClick(value)}
                    >
                      <span>{label}</span>
                      {isActive &&
                        (sortDirection === "asc" ? (
                          <ArrowUp size={12} aria-hidden="true" className={styles.sortCaret} />
                        ) : (
                          <ArrowDown size={12} aria-hidden="true" className={styles.sortCaret} />
                        ))}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className={styles.group}>
              <legend className={styles.groupLabel}>Years</legend>
              <div className={styles.yearRange}>
                <label className={styles.yearField}>
                  <span className={styles.visuallyHidden}>From year</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    className={styles.yearInput}
                    min={MIN_ENTRY_YEAR}
                    max={MAX_ENTRY_YEAR}
                    placeholder={String(MIN_ENTRY_YEAR)}
                    value={fromYear ?? ""}
                    onChange={(e) => handleYearChange("from", e.target.value)}
                    aria-label="Died in or after year"
                  />
                </label>
                <span aria-hidden="true" className={styles.yearSep}>
                  –
                </span>
                <label className={styles.yearField}>
                  <span className={styles.visuallyHidden}>To year</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    className={styles.yearInput}
                    min={MIN_ENTRY_YEAR}
                    max={MAX_ENTRY_YEAR}
                    placeholder={String(MAX_ENTRY_YEAR)}
                    value={toYear ?? ""}
                    onChange={(e) => handleYearChange("to", e.target.value)}
                    aria-label="Died in or before year"
                  />
                </label>
              </div>
            </fieldset>
          </div>

          {hasFilters && (
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.clearBtn}
                onClick={clearAll}
                title="Clear filters (Esc)"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </search>
  );
}
