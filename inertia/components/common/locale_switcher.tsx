import { ActionIcon, Image } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { LS_LANG_KEY } from '~/constants';

export function LocaleSwitcher() {
	const { i18n } = useTranslation();
	const newLanguage = i18n.language === 'en' ? 'fr' : 'en';
	return (
		<ActionIcon
			variant="light"
			aria-label="Toggle color scheme"
			onClick={() => {
				i18n.changeLanguage(newLanguage);
				localStorage.setItem(LS_LANG_KEY, newLanguage);
			}}
			size="lg"
		>
			<Image src={`/icons/${newLanguage}.svg`} alt={newLanguage} w={18} />
		</ActionIcon>
	);
}
