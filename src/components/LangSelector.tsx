import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Selector from './Selector';

export default function LangSelector() {
  const router = useRouter();
  const { t, i18n } = useTranslation();

  const onToggleLanguageClick = (newLocale: string) => {
    const { pathname, asPath, query } = router;
    i18n.changeLanguage(newLocale);
    router.push({ pathname, query }, asPath, { locale: newLocale });
  };
  const languages = ['en', 'fr'];

  return (
    <Selector
      name='lng-select'
      value={i18n.language}
      onChangeCallback={(value: string) => onToggleLanguageClick(value)}
      options={languages.map((lang: 'fr' | 'en') => ({
        label: t(`common:language.${lang}`),
        value: lang,
      }))}
    />
  );
}
