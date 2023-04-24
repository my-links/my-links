import { NextSeo } from "next-seo";

import styles from "styles/error-page.module.scss";

export default function Custom404() {
  return (
    <>
      <NextSeo title="Page introuvable" />
      <div className={styles["App"]}>
        <h1>404</h1>
        <h2>Cette page est introuvable.</h2>
      </div>
    </>
  );
}
