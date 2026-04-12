import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.text}>
          In memory of the products we actually used.{" "}
          <span className={styles.muted}>No flowers. Just one more pour.</span>
        </p>
      </div>
    </footer>
  );
}
