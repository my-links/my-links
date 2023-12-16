import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Selector from './Selector';

type Country = 'fr' | 'en';

export default function LangSelector({
  onSelected,
}: {
  onSelected?: (country: Country) => void;
}) {
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
      onChangeCallback={(value: Country) => {
        onToggleLanguageClick(value);
        if (onSelected) {
          setTimeout(() => onSelected(value), 150);
        }
      }}
      options={languages.map((lang: Country) => ({
        label: t(`common:language.${lang}`),
        value: lang,
      }))}
      formatOptionLabel={(country) => (
        <div
          className='country-option'
          style={{ display: 'flex', gap: '.5em', alignItems: 'center' }}
        >
          <Image
            src={`/icons/${country.value}.svg`}
            alt='country-image'
            height={24}
            width={24}
          />
          <span>{country.label}</span>
        </div>
      )}
    />
  );
}
