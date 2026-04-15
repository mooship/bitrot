import { Link } from "react-router-dom";
import { entries } from "../../data/entries";
import { CATEGORY_LABELS, CAUSE_LABELS, CAUSES_OF_DEATH, TECH_CATEGORIES } from "../../data/types";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { usePourStore } from "../../stores/usePourStore";
import styles from "./StatsPage.module.css";

function avg(nums: number[]): number {
  if (nums.length === 0) {
    return 0;
  }
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}

export function StatsPage() {
  useDocumentTitle("Stats · Bitrot");

  const pourCounts = usePourStore((s) => s.counts);

  const lifespans = entries.map((e) => e.died - e.born);
  const avgLifespan = avg(lifespans);

  const causeCounts = CAUSES_OF_DEATH.map((cause) => ({
    cause,
    count: entries.filter((e) => e.causeOfDeath === cause).length,
  })).sort((a, b) => b.count - a.count);

  const categoryCounts = TECH_CATEGORIES.map((cat) => ({
    cat,
    count: entries.filter((e) => e.category === cat).length,
  })).sort((a, b) => b.count - a.count);

  const maxCauseCount = Math.max(...causeCounts.map((c) => c.count));
  const maxCategoryCount = Math.max(...categoryCounts.map((c) => c.count));

  const topPoured = entries
    .map((e) => ({ entry: e, pours: pourCounts[e.id] ?? 0 }))
    .filter((e) => e.pours > 0)
    .sort((a, b) => b.pours - a.pours)
    .slice(0, 5);

  const shortestLived = [...entries]
    .sort((a, b) => a.died - a.born - (b.died - b.born))
    .slice(0, 5);
  const longestLived = [...entries].sort((a, b) => b.died - b.born - (a.died - a.born)).slice(0, 5);

  return (
    <article className={styles.container}>
      <Link to="/" className={styles.backLink}>
        &larr; Back to home
      </Link>

      <h1 className={styles.title}>Obituary Stats</h1>
      <p className={styles.subtitle}>A memorial by the numbers.</p>

      <div className={styles.overviewGrid}>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{entries.length}</span>
          <span className={styles.statLabel}>entries</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{avgLifespan.toFixed(1)}</span>
          <span className={styles.statLabel}>avg lifespan (years)</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{Math.min(...lifespans)}</span>
          <span className={styles.statLabel}>shortest life (years)</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{Math.max(...lifespans)}</span>
          <span className={styles.statLabel}>longest life (years)</span>
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.heading}>Cause of Death</h2>
        <ul className={styles.barList}>
          {causeCounts.map(({ cause, count }) => (
            <li key={cause} className={styles.barRow}>
              <span className={styles.barLabel}>{CAUSE_LABELS[cause]}</span>
              <div className={styles.barTrack}>
                <div
                  className={styles.bar}
                  style={{ width: `${(count / maxCauseCount) * 100}%` }}
                  aria-hidden="true"
                />
              </div>
              <span className={styles.barCount}>{count}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Category</h2>
        <ul className={styles.barList}>
          {categoryCounts.map(({ cat, count }) => (
            <li key={cat} className={styles.barRow}>
              <span className={styles.barLabel}>{CATEGORY_LABELS[cat]}</span>
              <div className={styles.barTrack}>
                <div
                  className={styles.bar}
                  style={{ width: `${(count / maxCategoryCount) * 100}%` }}
                  aria-hidden="true"
                />
              </div>
              <span className={styles.barCount}>{count}</span>
            </li>
          ))}
        </ul>
      </section>

      {topPoured.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.heading}>Most Mourned</h2>
          <ol className={styles.rankList}>
            {topPoured.map(({ entry, pours }) => (
              <li key={entry.id} className={styles.rankRow}>
                <Link to={`/entry/${entry.id}`} className={styles.rankName}>
                  {entry.name}
                </Link>
                <span className={styles.rankCount}>
                  {pours.toLocaleString()} {pours === 1 ? "pour" : "pours"}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className={styles.section}>
        <h2 className={styles.heading}>Short-lived</h2>
        <ol className={styles.rankList}>
          {shortestLived.map((entry) => (
            <li key={entry.id} className={styles.rankRow}>
              <Link to={`/entry/${entry.id}`} className={styles.rankName}>
                {entry.name}
              </Link>
              <span className={styles.rankCount}>{entry.died - entry.born}y</span>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Long-lived</h2>
        <ol className={styles.rankList}>
          {longestLived.map((entry) => (
            <li key={entry.id} className={styles.rankRow}>
              <Link to={`/entry/${entry.id}`} className={styles.rankName}>
                {entry.name}
              </Link>
              <span className={styles.rankCount}>{entry.died - entry.born}y</span>
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
