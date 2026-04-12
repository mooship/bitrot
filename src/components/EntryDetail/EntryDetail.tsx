import clsx from "clsx";
import { Copy, Share2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { DeadTech } from "../../data/types";
import { CATEGORY_LABELS, CAUSE_LABELS } from "../../data/types";
import { useThemeStore } from "../../stores/useThemeStore";
import { getAccentColor } from "../../utils/color";
import { PourButton } from "../PourButton/PourButton";
import styles from "./EntryDetail.module.css";

interface EntryDetailProps {
  entry: DeadTech | null;
  onClose: () => void;
}

export function EntryDetail({ entry, onClose }: EntryDetailProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const theme = useThemeStore((s) => s.theme);
  const [copied, setCopied] = useState(false);

  const accent = entry?.brandColor ? getAccentColor(entry.brandColor, theme) : undefined;
  const canShare = typeof navigator.share === "function";

  useEffect(() => {
    if (!entry) {
      return;
    }
    closeButtonRef.current?.focus();
  }, [entry]);

  useEffect(() => {
    if (!entry) {
      return;
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") {
        return;
      }
      const panel = panelRef.current;
      if (!panel) {
        return;
      }
      const focusable = panel.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [entry, onClose]);

  useEffect(() => {
    if (entry) {
      document.title = `${entry.name} — Bitrot`;
    } else {
      document.title = "Bitrot — Dead Tech Memorial";
    }
  }, [entry]);

  useEffect(() => {
    return () => clearTimeout(copyTimeoutRef.current);
  }, []);

  async function handleShare() {
    const url = `${window.location.origin}${window.location.pathname}#/entry/${entry?.id}`;
    if (canShare) {
      try {
        await navigator.share({ title: entry?.name, text: entry?.tagline, url });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
      } catch {}
    }
  }

  if (!entry) {
    return null;
  }

  const lifespan = entry.died - entry.born;

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
        className={clsx(styles.panel, styles.open)}
        style={accent ? ({ "--entry-accent": accent } as React.CSSProperties) : undefined}
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
            {entry.parent && (
              <>
                <dt>Parent</dt>
                <dd>{entry.parent}</dd>
              </>
            )}
            {entry.killedBy && (
              <>
                <dt>Killed by</dt>
                <dd>{entry.killedBy}</dd>
              </>
            )}
            {entry.peakYear && (
              <>
                <dt>Peak</dt>
                <dd>
                  {entry.peakYear}
                  {entry.peakMetric ? ` — ${entry.peakMetric}` : ""}
                </dd>
              </>
            )}
            <dt>Category</dt>
            <dd>{CATEGORY_LABELS[entry.category]}</dd>
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
            <span>{canShare ? "Share" : copied ? "Copied!" : "Copy link"}</span>
          </button>
        </footer>
      </div>
    </>
  );
}
