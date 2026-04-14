import { Link } from "react-router-dom";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import styles from "./PrivacyPolicy.module.css";

export function PrivacyPolicy() {
  useDocumentTitle("Privacy Policy · Bitrot");
  return (
    <article className={styles.container}>
      <Link to="/" className={styles.backLink}>
        &larr; Back to home
      </Link>
      <h1 className={styles.title}>Privacy Policy</h1>
      <p className={styles.updated}>Last updated: April 12, 2026</p>

      <section className={styles.section}>
        <h2 className={styles.heading}>What we collect</h2>
        <p>
          This site uses{" "}
          <a
            href="https://www.cloudflare.com/web-analytics/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Cloudflare Web Analytics
          </a>{" "}
          to understand how visitors use the site. Cloudflare Web Analytics is a privacy-first
          analytics tool that does not use any client-side state&mdash;such as cookies or
          localStorage&mdash;to collect metrics. It does not track individual visitors across sites
          or sessions.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Data collected by Cloudflare</h2>
        <p>Cloudflare may collect the following anonymous, aggregated data points:</p>
        <ul className={styles.list}>
          <li>Page views and visits</li>
          <li>Referrer information</li>
          <li>Browser and operating system type</li>
          <li>Country of origin</li>
        </ul>
        <p>
          This data cannot be used to identify individual users. No personal information is
          collected, stored, or sold.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Cookies</h2>
        <p>
          This site does not set any cookies. Cloudflare Web Analytics operates entirely without
          cookies.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Third parties</h2>
        <p>
          No data is shared with third parties beyond what Cloudflare processes to provide its
          analytics service. You can read{" "}
          <a
            href="https://www.cloudflare.com/privacypolicy/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Cloudflare&rsquo;s privacy policy
          </a>{" "}
          for more details.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Changes to this policy</h2>
        <p>
          If this policy is updated, the changes will be reflected on this page with an updated
          date.
        </p>
      </section>
    </article>
  );
}
