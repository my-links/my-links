import { useRouter } from "next/router";
import styles from "./lang-selector.module.scss";

export default function LangSelector() {
  const router = useRouter();

  const onToggleLanguageClick = (newLocale: string) => {
    const { pathname, asPath, query } = router;
    router.push({ pathname, query }, asPath, { locale: newLocale });
  };
  const languages = ["en", "fr"];

  return (
    <div className={styles["lang-selector"]}>
      <select
        name="lng-select"
        id="lng-select"
        onChange={(event) => {
          onToggleLanguageClick(event.target.value);
        }}
      >
        {languages.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
    </div>
  );
}
