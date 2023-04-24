import { NextSeo } from "next-seo";

import styles from "styles/error-page.module.scss";

export default function Custom500() {
  return (
    <>
      <NextSeo title="Une erreur est survenue" />
      <div className={styles["App"]}>
        <h1>500</h1>
        <h2>Une erreur côté serveur est survenue.</h2>
      </div>
    </>
  );
}
