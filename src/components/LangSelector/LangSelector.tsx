import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import styles from "./lang-selector.module.scss";

export default function LangSelector() {
  const router = useRouter();
  const { i18n } = useTranslation();

  const onToggleLanguageClick = (newLocale: string) => {
    const { pathname, asPath, query } = router;
    i18n.changeLanguage(newLocale);
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
        value={i18n.language}
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
