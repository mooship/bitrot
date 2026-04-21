import { useNavigate } from "react-router-dom";
import { entries } from "../../data/entries";
import { CATEGORY_LABELS, CAUSE_LABELS } from "../../data/types";
import styles from "./Graveyard.module.css";

const PADDING_YEARS = 2;
const ROW_HEIGHT = 8;
const ROW_GAP = 2;
const AXIS_HEIGHT = 22;
const HORIZONTAL_PADDING = 16;
const WIDTH = 800;

function niceStep(range: number): number {
  if (range <= 10) {
    return 2;
  }
  if (range <= 30) {
    return 5;
  }
  if (range <= 80) {
    return 10;
  }
  return 20;
}

const SORTED_ENTRIES = [...entries].sort((a, b) => a.born - b.born || a.died - b.died);

const { minYear, maxYear } = SORTED_ENTRIES.reduce(
  (acc, e) => ({
    minYear: Math.min(acc.minYear, e.born),
    maxYear: Math.max(acc.maxYear, e.died),
  }),
  { minYear: Number.POSITIVE_INFINITY, maxYear: Number.NEGATIVE_INFINITY }
);

const MIN_YEAR = minYear - PADDING_YEARS;
const MAX_YEAR = maxYear + PADDING_YEARS;
const SPAN = Math.max(1, MAX_YEAR - MIN_YEAR);
const HEIGHT = SORTED_ENTRIES.length * (ROW_HEIGHT + ROW_GAP) + AXIS_HEIGHT;
const PLOT_WIDTH = WIDTH - HORIZONTAL_PADDING * 2;

function yearToX(year: number): number {
  return HORIZONTAL_PADDING + ((year - MIN_YEAR) / SPAN) * PLOT_WIDTH;
}

const TICKS: number[] = (() => {
  const step = niceStep(SPAN);
  const tickStart = Math.ceil(MIN_YEAR / step) * step;
  const out: number[] = [];
  for (let y = tickStart; y <= MAX_YEAR; y += step) {
    out.push(y);
  }
  return out;
})();

export function Graveyard() {
  const navigate = useNavigate();

  if (SORTED_ENTRIES.length === 0) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <p className={styles.caption}>
        Each line is a lifespan — born on the left, dead on the right. Click to open.
      </p>
      <div className={styles.scroll}>
        <svg
          className={styles.svg}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label={`Graveyard timeline of ${SORTED_ENTRIES.length} dead technologies from ${
            MIN_YEAR + PADDING_YEARS
          } to ${MAX_YEAR - PADDING_YEARS}`}
          preserveAspectRatio="none"
        >
          <g className={styles.axis}>
            {TICKS.map((year) => (
              <g key={year}>
                <line
                  x1={yearToX(year)}
                  x2={yearToX(year)}
                  y1={0}
                  y2={HEIGHT - AXIS_HEIGHT}
                  className={styles.gridLine}
                />
                <text
                  x={yearToX(year)}
                  y={HEIGHT - 6}
                  className={styles.axisLabel}
                  textAnchor="middle"
                >
                  {year}
                </text>
              </g>
            ))}
          </g>

          {SORTED_ENTRIES.map((entry, i) => {
            const x1 = yearToX(entry.born);
            const x2 = yearToX(entry.died);
            const y = i * (ROW_HEIGHT + ROW_GAP) + ROW_HEIGHT / 2;
            const lineWidth = Math.max(2, x2 - x1);
            return (
              <a
                key={entry.id}
                href={`/entry/${entry.id}`}
                className={styles.row}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/entry/${entry.id}`);
                }}
                aria-label={`${entry.name} (${entry.born}–${entry.died})`}
              >
                <title>
                  {entry.name} ({entry.born}–{entry.died}) · {CATEGORY_LABELS[entry.category]} ·{" "}
                  {CAUSE_LABELS[entry.causeOfDeath]}
                </title>
                <line
                  x1={x1}
                  x2={x1 + lineWidth}
                  y1={y}
                  y2={y}
                  className={styles.lifespan}
                  strokeLinecap="round"
                />
                <circle cx={x2} cy={y} r={2.5} className={styles.endDot} />
              </a>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
