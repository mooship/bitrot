import clsx from "clsx";
import { useRef } from "react";
import type { DeadTech } from "../../data/types";
import { CAUSE_LABELS } from "../../data/types";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { useThemeStore } from "../../stores/useThemeStore";
import { getAccentColor } from "../../utils/color";
import styles from "./EntryCard.module.css";

interface EntryCardProps {
  entry: DeadTech;
  onSelect: (id: string) => void;
}

export function EntryCard({ entry, onSelect }: EntryCardProps) {
  const ref = useRef<HTMLElement>(null);
  const isVisible = useScrollReveal(ref);
  const theme = useThemeStore((s) => s.theme);
  const accent = entry.brandColor ? getAccentColor(entry.brandColor, theme) : undefined;

  const lifespan = entry.died - entry.born;

  return (
    <article
      ref={ref}
      className={clsx(styles.card, isVisible && styles.visible)}
      style={accent ? ({ "--entry-accent": accent } as React.CSSProperties) : undefined}
    >
      <button
        type="button"
        className={styles.trigger}
        onClick={() => onSelect(entry.id)}
        aria-label={`${entry.name}, ${entry.born}–${entry.died}. ${CAUSE_LABELS[entry.causeOfDeath]}. Read autopsy.`}
      >
        <div className={styles.accent} aria-hidden="true" />

        <div className={styles.body}>
          <div className={styles.meta}>
            <span className={styles.dates}>
              {entry.born}–{entry.died}
            </span>
            <span className={styles.lifespan}>{lifespan}y</span>
          </div>

          <h2 className={styles.name}>{entry.name}</h2>
          <p className={styles.tagline}>{entry.tagline}</p>

          <div className={styles.footer}>
            <span className={styles.causeBadge}>{CAUSE_LABELS[entry.causeOfDeath]}</span>
            {entry.parent && <span className={styles.parent}>{entry.parent}</span>}
          </div>
        </div>
      </button>
    </article>
  );
}
