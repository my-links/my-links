import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import Selector from '~/components/common/form/selector';
import { LS_LANG_KEY } from '~/constants';
import { languages } from '~/i18n';

type Country = 'fr' | 'en';

export default function LangSelector({
	onSelected,
}: {
	onSelected?: (country: Country) => void;
}) {
	const { t, i18n } = useTranslation('common');

	const onToggleLanguageClick = (newLocale: string) => {
		dayjs.locale(newLocale);
		i18n.changeLanguage(newLocale);
		localStorage.setItem(LS_LANG_KEY, newLocale);
	};

	return (
		<Selector
			name="lng-select"
			label={t('select-your-lang')}
			value={i18n.language}
			onChangeCallback={(value) => {
				onToggleLanguageClick(value.toString());
				if (onSelected) {
					setTimeout(() => onSelected(value.toString() as Country), 150);
				}
			}}
			options={languages.map((lang: Country) => ({
				label: t(`language.${lang}`),
				value: lang,
			}))}
			formatOptionLabel={(country) => (
				<div
					className="country-option"
					style={{ display: 'flex', gap: '.5em', alignItems: 'center' }}
				>
					<img
						src={`/icons/${country.value}.svg`}
						alt="country-image"
						height={24}
						width={24}
					/>
					<span>{country.label}</span>
				</div>
			)}
		/>
	);
}
