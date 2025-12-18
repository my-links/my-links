import { api } from '#adonis/api';
import { PRIMARY_COLOR } from '#config/project';
import { DEFAULT_LOCALE } from '#shared/consts/i18n';
import { Locale } from '#shared/types/i18n';
import { PageProps } from '@adonisjs/inertia/types';
import { usePage } from '@inertiajs/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import {
	ColorSchemeScript,
	createTheme,
	MantineProvider,
	rem,
} from '@mantine/core';
import '@mantine/core/styles.css';
import { ModalsProvider } from '@mantine/modals';
import '@mantine/spotlight/styles.css';
import { createTuyau } from '@tuyau/client';
import { TuyauProvider } from '@tuyau/inertia/react';
import { ReactNode, useEffect, useMemo } from 'react';
import 'virtual:uno.css';
import '~/css/app.css';
import { useAppUrl } from '~/hooks/use_app_url';
import { usePageTransition } from '~/hooks/use_page_transition';
import { dynamicActivate } from '~/i18n';

const customTheme = createTheme({
	colors: {
		blue: [
			'#e7f5ff',
			'#d0ebff',
			'#a5d8ff',
			'#74c0fc',
			'#4dabf7',
			PRIMARY_COLOR,
			'#228be6',
			'#1c7ed6',
			'#1971c2',
			'#1864ab',
		],
	},
	primaryColor: 'blue',
	fontFamily: 'Poppins, sans-serif',
	respectReducedMotion: true,
	components: {
		Button: {
			styles: {
				root: {
					fontWeight: '400',
				},
			},
		},
		Badge: {
			styles: {
				root: {
					fontWeight: '500',
				},
			},
		},
	},
	headings: {
		fontWeight: '400',

		sizes: {
			h1: {
				fontSize: rem(36),
				lineHeight: '1.4',
			},
			h2: { fontSize: rem(30), lineHeight: '1.2' },
			h3: { fontSize: rem(24), lineHeight: '1.2' },
			h4: { fontSize: rem(20), lineHeight: '1.2' },
			h5: { fontSize: rem(16), lineHeight: '1.2' },
			h6: { fontSize: rem(12), lineHeight: '1.2' },
		},
	},
});

export function BaseLayout({ children }: { children: ReactNode }) {
	const appUrl = useAppUrl();
	const { props } = usePage<PageProps & { locale: Locale }>();

	usePageTransition({
		querySelector: '[data-page-transition]',
	});

	const tuyauClient = createTuyau({
		api,
		baseUrl: appUrl,
	});

	const locale = useMemo(() => {
		return (props.locale as Locale) ?? DEFAULT_LOCALE;
	}, [props.locale]);

	useEffect(() => {
		if (i18n.locale !== locale) {
			dynamicActivate(locale);
		}
	}, [locale]);

	return (
		<I18nProvider i18n={i18n}>
			<TuyauProvider client={tuyauClient}>
				<ColorSchemeScript />
				<MantineProvider theme={customTheme}>
					<ModalsProvider>{children}</ModalsProvider>
				</MantineProvider>
			</TuyauProvider>
		</I18nProvider>
	);
}
