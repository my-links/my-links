import { ColorSchemeScript, createTheme, MantineProvider } from '@mantine/core';
import dayjs from 'dayjs';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import '@mantine/core/styles.css';
import '@mantine/spotlight/styles.css';

const theme = createTheme({});

export default function BaseLayout({ children }: { children: ReactNode }) {
	const { i18n } = useTranslation();
	dayjs.locale(i18n.language);
	return (
		<>
			<ColorSchemeScript />
			<MantineProvider theme={theme}>{children}</MantineProvider>
		</>
	);
}
