import { useEffect } from "react";
import { Link } from "react-router-dom";
import { updatePageSeo } from "../../utils/seo";
import styles from "./AboutPage.module.css";

export function AboutPage() {
  useEffect(() => {
    updatePageSeo("about");
  }, []);
  return (
    <article className={styles.container}>
      <Link to="/" className={styles.backLink}>
        &larr; Back to home
      </Link>
      <h1 className={styles.title}>About Bitrot</h1>
      <p>
        Bitrot is an interactive memorial for dead technology. Each entry is a short eulogy for
        software, services, and hardware that people actually used — and that are now gone.
      </p>

      <section className={styles.section}>
        <h2 className={styles.heading}>Missing something?</h2>
        <p>
          If something is missing or wrong, you can{" "}
          <a
            href="https://github.com/mooship/bitrot/issues"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            open an issue on GitHub
          </a>
          .
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Built by</h2>
        <p>
          <a
            href="https://timothybrits.co.za"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Timothy Brits
          </a>
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Open source</h2>
        <p>
          Bitrot is open source under the{" "}
          <a
            href="https://github.com/mooship/bitrot/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            GPL-3.0 license
          </a>
          .
        </p>
      </section>
    </article>
  );
}
