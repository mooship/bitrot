import clsx from "clsx";
import { ChevronLeft, ChevronRight, Copy, Share2, X } from "lucide-react";
import { Fragment, type ReactNode, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { entries } from "../../data/entries";
import type { DeadTech } from "../../data/types";
import { CATEGORY_LABELS, CAUSE_LABELS } from "../../data/types";
import { useEntryAccent } from "../../hooks/useEntryAccent";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useShareOrCopy } from "../../hooks/useShareOrCopy";
import { useFilterStore } from "../../stores/useFilterStore";
import { getRelatedEntries } from "../../utils/related";
import { getEntryUrl, updateSeo } from "../../utils/seo";
import { PourButton } from "../PourButton/PourButton";
import styles from "./EntryDetail.module.css";

interface EntryDetailProps {
  entry: DeadTech | null;
  onClose: () => void;
  prevEntry?: DeadTech | null;
  nextEntry?: DeadTech | null;
}

interface Fact {
  label: string;
  value: ReactNode;
}

function cleanCrossLinkTerm(raw: string): string {
  const parenIndex = raw.indexOf(" (");
  const trimmed = parenIndex >= 0 ? raw.slice(0, parenIndex) : raw;
  return trimmed.trim();
}

interface CrossLinkProps {
  value: string;
  onNavigate: (term: string) => void;
}

function CrossLink({ value, onNavigate }: CrossLinkProps) {
  const term = cleanCrossLinkTerm(value);
  return (
    <button
      type="button"
      className={styles.crossLink}
      onClick={() => onNavigate(term)}
      aria-label={`Show entries related to ${term}`}
    >
      {value}
    </button>
  );
}

function buildFacts(entry: DeadTech, onCrossLink: (term: string) => void): Fact[] {
  const facts: Fact[] = [];
  if (entry.parent) {
    facts.push({
      label: "Parent",
      value: <CrossLink value={entry.parent} onNavigate={onCrossLink} />,
    });
  }
  if (entry.killedBy) {
    facts.push({
      label: "Killed by",
      value: <CrossLink value={entry.killedBy} onNavigate={onCrossLink} />,
    });
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

export function EntryDetail({ entry, onClose, prevEntry, nextEntry }: EntryDetailProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const accentStyle = useEntryAccent(entry?.brandColor);
  const { canShare, copyState, share } = useShareOrCopy();
  const navigate = useNavigate();

  useFocusTrap(panelRef, { active: !!entry, onEscape: onClose });

  useEffect(() => {
    updateSeo(entry);
  }, [entry]);

  useEffect(() => {
    if (entry) {
      closeButtonRef.current?.focus();
    }
  }, [entry]);

  useEffect(() => {
    if (!entry) {
      return;
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
        return;
      }
      const target = e.target as HTMLElement;
      const inEditable =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if (inEditable) {
        return;
      }
      if (e.key === "ArrowLeft" && prevEntry) {
        e.preventDefault();
        navigate(`/entry/${prevEntry.id}`);
      } else if (e.key === "ArrowRight" && nextEntry) {
        e.preventDefault();
        navigate(`/entry/${nextEntry.id}`);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [entry, prevEntry, nextEntry, navigate]);

  if (!entry) {
    return null;
  }

  const lifespan = entry.died - entry.born;

  const handleCrossLink = (term: string) => {
    useFilterStore.setState({
      searchQuery: term,
      activeCauses: new Set(),
      activeCategories: new Set(),
    });
    onClose();
    navigate("/");
  };

  const facts = buildFacts(entry, handleCrossLink);
  const related = getRelatedEntries(entry, entries);

  const handleShare = () => {
    void share({ title: entry.name, text: entry.tagline, url: getEntryUrl(entry.id) });
  };

  const handleRelatedClick = (id: string) => {
    navigate(`/entry/${id}`);
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
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.navBtn}
              onClick={() => prevEntry && navigate(`/entry/${prevEntry.id}`)}
              disabled={!prevEntry}
              aria-label={prevEntry ? `Previous: ${prevEntry.name}` : "No previous entry"}
              title={prevEntry ? `Previous: ${prevEntry.name} (←)` : undefined}
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={styles.navBtn}
              onClick={() => nextEntry && navigate(`/entry/${nextEntry.id}`)}
              disabled={!nextEntry}
              aria-label={nextEntry ? `Next: ${nextEntry.name}` : "No next entry"}
              title={nextEntry ? `Next: ${nextEntry.name} (→)` : undefined}
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
            <button
              ref={closeButtonRef}
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label={`Close ${entry.name}`}
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
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

          {related.length > 0 && (
            <section className={styles.related} aria-labelledby="detail-related-heading">
              <h3 id="detail-related-heading" className={styles.relatedHeading}>
                Related obituaries
              </h3>
              <ul className={styles.relatedList}>
                {related.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={styles.relatedItem}
                      onClick={() => handleRelatedClick(item.id)}
                    >
                      <span className={styles.relatedName}>{item.name}</span>
                      <span className={styles.relatedDates}>
                        {item.born}–{item.died}
                      </span>
                      <span className={styles.relatedCause}>{CAUSE_LABELS[item.causeOfDeath]}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
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
