import PageTransition from "components/PageTransition";
import { NextSeo } from "next-seo";
import styles from "styles/error-page.module.scss";
import NavbarUntranslated from "../components/Navbar/NavbarUntranslated";

export default function Custom500() {
  return (
    <PageTransition className={styles["App"]} hideLangageSelector>
      <NextSeo title="Internal server error" />
      <NavbarUntranslated />
      <header>
        <h1>500</h1>
        <h2>An internal server error has occurred</h2>
      </header>
    </PageTransition>
  );
}
