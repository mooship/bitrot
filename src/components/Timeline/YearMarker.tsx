import styles from "./YearMarker.module.css";

interface YearMarkerProps {
  year: number;
}

export function YearMarker({ year }: YearMarkerProps) {
  return (
    <li className={styles.wrapper} aria-hidden="true">
      <span className={styles.year}>{year}</span>
      <span className={styles.line} />
    </li>
  );
}
