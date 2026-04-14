import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.text}>
          In memory of the products we actually used.{" "}
          <span className={styles.muted}>No flowers. Just one more pour.</span>
        </p>
        <div className={styles.links}>
          <Link to="/privacy" className={styles.privacyLink}>
            Privacy Policy
          </Link>
          <Link to="/about" className={styles.privacyLink}>
            About
          </Link>
        </div>
      </div>
    </footer>
  );
}
