import clsx from "clsx";
import { Copy, Share2, X } from "lucide-react";
import { Fragment, type ReactNode, useEffect, useRef } from "react";
import type { DeadTech } from "../../data/types";
import { CATEGORY_LABELS, CAUSE_LABELS } from "../../data/types";
import { useEntryAccent } from "../../hooks/useEntryAccent";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useShareOrCopy } from "../../hooks/useShareOrCopy";
import { getEntryUrl, updateSeo } from "../../utils/seo";
import { PourButton } from "../PourButton/PourButton";
import styles from "./EntryDetail.module.css";

interface EntryDetailProps {
  entry: DeadTech | null;
  onClose: () => void;
}

interface Fact {
  label: string;
  value: ReactNode;
}

function buildFacts(entry: DeadTech): Fact[] {
  const facts: Fact[] = [];
  if (entry.parent) {
    facts.push({ label: "Parent", value: entry.parent });
  }
  if (entry.killedBy) {
    facts.push({ label: "Killed by", value: entry.killedBy });
  }
  if (entry.peakYear) {
    facts.push({
      label: "Peak",
      value: entry.peakMetric ? `${entry.peakYear} — ${entry.peakMetric}` : `${entry.peakYear}`,
    });
  }
  facts.push({ label: "Category", value: CATEGORY_LABELS[entry.category] });
  return facts;
}

function getCopyLabel(state: ReturnType<typeof useShareOrCopy>["copyState"]): string {
  switch (state) {
    case "copied":
      return "Copied!";
    case "error":
      return "Copy failed";
    default:
      return "Copy link";
  }
}

export function EntryDetail({ entry, onClose }: EntryDetailProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const accentStyle = useEntryAccent(entry?.brandColor);
  const { canShare, copyState, share } = useShareOrCopy();

  useFocusTrap(panelRef, { active: !!entry, onEscape: onClose });

  useEffect(() => {
    if (entry) {
      closeButtonRef.current?.focus();
    }
  }, [entry]);

  useEffect(() => {
    updateSeo(entry);
  }, [entry]);

  if (!entry) {
    return null;
  }

  const lifespan = entry.died - entry.born;
  const facts = buildFacts(entry);

  const handleShare = () => {
    void share({ title: entry.name, text: entry.tagline, url: getEntryUrl(entry.id) });
  };

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
        className={clsx(styles.panel, styles.open)}
        style={accentStyle}
      >
        <div className={styles.accentBar} aria-hidden="true" />

        <header className={styles.header}>
          <div className={styles.headerMeta}>
            <span className={styles.dates}>
              {entry.born}–{entry.died} · {lifespan} {lifespan === 1 ? "year" : "years"}
            </span>
            <span className={styles.causeBadge}>{CAUSE_LABELS[entry.causeOfDeath]}</span>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className={styles.body}>
          <h2 id="detail-title" className={styles.name}>
            {entry.name}
          </h2>
          <p className={styles.tagline}>{entry.tagline}</p>

          <p className={styles.autopsy}>{entry.autopsy}</p>

          <dl className={styles.facts}>
            {facts.map((fact) => (
              <Fragment key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </Fragment>
            ))}
          </dl>
        </div>

        <footer className={styles.footer}>
          <PourButton entryId={entry.id} entryName={entry.name} />
          <button
            type="button"
            className={styles.shareBtn}
            onClick={handleShare}
            aria-label={canShare ? "Share this entry" : "Copy link to this entry"}
          >
            {canShare ? (
              <Share2 size={16} aria-hidden="true" />
            ) : (
              <Copy size={16} aria-hidden="true" />
            )}
            <span>{canShare ? "Share" : getCopyLabel(copyState)}</span>
          </button>
        </footer>
      </div>
    </>
  );
}
