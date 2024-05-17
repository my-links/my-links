import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { LS_LANG_KEY } from '~/constants';
import { languages } from '~/i18n';

export default function LangSelector() {
  const { t, i18n } = useTranslation('common');

  const onToggleLanguageClick = ({
    target,
  }: ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(target.value);
    localStorage.setItem(LS_LANG_KEY, target.value);
  };

  return (
    <select
      onChange={onToggleLanguageClick}
      name="lang-selector"
      id="lang-selector"
      defaultValue={i18n.language}
    >
      {languages.map((lang) => (
        <option value={lang}>{t(`language.${lang}`)}</option>
      ))}
    </select>
  );
}
