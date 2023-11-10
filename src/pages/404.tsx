import PageTransition from "components/PageTransition";
import PATHS from "constants/paths";
import { NextSeo } from "next-seo";
import Link from "next/link";
import styles from "styles/error-page.module.scss";

export default function Custom404() {
  return (
    <PageTransition hideLangageSelector>
      <NextSeo title="Page not found" />
      <div className={styles["App"]}>
        <h1>404</h1>
        <h2>Page not found</h2>
      </div>
      <Link href={PATHS.HOME}>← Back to home page</Link>
    </PageTransition>
  );
}
