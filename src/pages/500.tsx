import PageTransition from "components/PageTransition";
import PATHS from "constants/paths";
import { NextSeo } from "next-seo";
import Link from "next/link";
import styles from "styles/error-page.module.scss";

export default function Custom500() {
  return (
    <PageTransition hideLangageSelector>
      <NextSeo title="Internal server error" />
      <div className={styles["App"]}>
        <h1>500</h1>
        <h2>An internal server error has occurred</h2>
      </div>
      <Link href={PATHS.HOME}>← Back to home page</Link>
    </PageTransition>
  );
}
