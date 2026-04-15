import { useToastStore } from "../../stores/useToastStore";
import styles from "./Toast.module.css";

export function Toast() {
  const toast = useToastStore((s) => s.toast);
  const dismiss = useToastStore((s) => s.dismiss);

  if (!toast) {
    return null;
  }

  return (
    <div role="alert" aria-live="assertive" aria-atomic="true" className={styles.toast}>
      <span className={styles.message}>{toast.message}</span>
      <button type="button" className={styles.dismiss} onClick={dismiss} aria-label="Dismiss">
        ✕
      </button>
    </div>
  );
}
