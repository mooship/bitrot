import { useNavigate } from "react-router-dom";
import { entries } from "../../data/entries";
import { CATEGORY_LABELS, CAUSE_LABELS } from "../../data/types";
import styles from "./Graveyard.module.css";

const PADDING_YEARS = 2;
const ROW_HEIGHT = 8;
const ROW_GAP = 2;
const AXIS_HEIGHT = 22;
const HORIZONTAL_PADDING = 16;

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

export function Graveyard() {
  const navigate = useNavigate();

  if (entries.length === 0) {
    return null;
  }

  const sorted = [...entries].sort((a, b) => a.born - b.born || a.died - b.died);
  const minYear = Math.min(...sorted.map((e) => e.born)) - PADDING_YEARS;
  const maxYear = Math.max(...sorted.map((e) => e.died)) + PADDING_YEARS;
  const span = Math.max(1, maxYear - minYear);

  const width = 800;
  const height = sorted.length * (ROW_HEIGHT + ROW_GAP) + AXIS_HEIGHT;
  const plotWidth = width - HORIZONTAL_PADDING * 2;

  const yearToX = (year: number) => HORIZONTAL_PADDING + ((year - minYear) / span) * plotWidth;

  const step = niceStep(span);
  const tickStart = Math.ceil(minYear / step) * step;
  const ticks: number[] = [];
  for (let y = tickStart; y <= maxYear; y += step) {
    ticks.push(y);
  }

  return (
    <div className={styles.wrapper}>
      <p className={styles.caption}>
        Each line is a lifespan — born on the left, dead on the right. Click to open.
      </p>
      <div className={styles.scroll}>
        <svg
          className={styles.svg}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`Graveyard timeline of ${entries.length} dead technologies from ${
            minYear + PADDING_YEARS
          } to ${maxYear - PADDING_YEARS}`}
          preserveAspectRatio="none"
        >
          <g className={styles.axis}>
            {ticks.map((year) => (
              <g key={year}>
                <line
                  x1={yearToX(year)}
                  x2={yearToX(year)}
                  y1={0}
                  y2={height - AXIS_HEIGHT}
                  className={styles.gridLine}
                />
                <text
                  x={yearToX(year)}
                  y={height - 6}
                  className={styles.axisLabel}
                  textAnchor="middle"
                >
                  {year}
                </text>
              </g>
            ))}
          </g>

          {sorted.map((entry, i) => {
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
