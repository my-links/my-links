import dayjs from 'dayjs';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import ContextThemeProvider from '~/components/layouts/_theme_layout';
import DarkThemeContextProvider from '~/contexts/dark_theme_context';

export default function BaseLayout({ children }: { children: ReactNode }) {
	const { i18n } = useTranslation();
	dayjs.locale(i18n.language);
	return (
		<DarkThemeContextProvider key="a">
			<ContextThemeProvider>{children}</ContextThemeProvider>
		</DarkThemeContextProvider>
	);
}
