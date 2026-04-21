import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { isEditableTarget, isInDialog } from "../../utils/dom";
import { currentEntryId, pickRandomEntry } from "../../utils/random";
import styles from "./ShortcutHelp.module.css";

const SHORTCUTS: { keys: string[]; description: string }[] = [
  { keys: ["/"], description: "Focus the search field" },
  { keys: ["Esc"], description: "Clear filters or close dialogs" },
  { keys: ["←", "→"], description: "Previous / next obituary in detail view" },
  { keys: ["r"], description: "Open a random obituary" },
  { keys: ["?"], description: "Show this shortcuts overlay" },
];

export function ShortcutHelp() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const pathnameRef = useRef(location.pathname);
  pathnameRef.current = location.pathname;

  useFocusTrap(panelRef, { active: open, onEscape: () => setOpen(false) });

  useEffect(() => {
    if (open) {
      closeRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isEditableTarget(e.target)) {
        return;
      }
      if (isInDialog(e.target)) {
        return;
      }
      if (e.key === "?" && !open) {
        e.preventDefault();
        setOpen(true);
        return;
      }
      if (e.key === "r" && !open) {
        const pick = pickRandomEntry(currentEntryId(pathnameRef.current));
        if (pick) {
          e.preventDefault();
          navigate(`/entry/${pick.id}`);
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, navigate]);

  if (!open) {
    return null;
  }

  return (
    <>
      <div className={styles.backdrop} onClick={() => setOpen(false)} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcut-help-title"
        className={styles.panel}
      >
        <header className={styles.header}>
          <h2 id="shortcut-help-title" className={styles.title}>
            Keyboard shortcuts
          </h2>
          <button
            ref={closeRef}
            type="button"
            className={styles.closeBtn}
            onClick={() => setOpen(false)}
            aria-label="Close keyboard shortcuts"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        <dl className={styles.list}>
          {SHORTCUTS.map(({ keys, description }) => (
            <div key={description} className={styles.row}>
              <dt className={styles.keys}>
                {keys.map((key, i) => (
                  <span key={key}>
                    {i > 0 && <span className={styles.keySep}>/</span>}
                    <kbd className={styles.kbd}>{key}</kbd>
                  </span>
                ))}
              </dt>
              <dd className={styles.desc}>{description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </>
  );
}
