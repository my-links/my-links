import { api } from '#adonis/api';
import { PRIMARY_COLOR } from '#config/project';
import { router } from '@inertiajs/react';
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
import dayjs from 'dayjs';
import { ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import 'virtual:uno.css';
import '~/css/app.css';
import { useAppUrl } from '~/hooks/use_app_url';

const TRANSITION_IN_CLASS = '__transition_fadeIn';
const TRANSITION_OUT_CLASS = '__transition_fadeOut';

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
	const { i18n } = useTranslation();
	const appUrl = useAppUrl();
	dayjs.locale(i18n.language);

	const tuyauClient = createTuyau({
		api,
		baseUrl: appUrl,
	});

	const findAppElement = () => document.getElementById('app');

	const flipClass = (addClass: string, removeClass: string) => {
		const appElement = findAppElement();
		if (appElement) {
			appElement.classList.add(addClass);
			appElement.classList.remove(removeClass);
		}
	};

	const canTransition = (currentLocation: URL, newLocation: URL) =>
		currentLocation.pathname !== newLocation.pathname;

	useEffect(() => {
		const currentLocation = new URL(window.location.href);

		const removeStartEventListener = router.on(
			'start',
			(event) =>
				canTransition(currentLocation, event.detail.visit.url) &&
				flipClass(TRANSITION_OUT_CLASS, TRANSITION_IN_CLASS)
		);
		const removefinishEventListener = router.on(
			'finish',
			(event) =>
				canTransition(currentLocation, event.detail.visit.url) &&
				flipClass(TRANSITION_IN_CLASS, TRANSITION_OUT_CLASS)
		);

		return () => {
			removeStartEventListener();
			removefinishEventListener();
		};
	}, []);

	return (
		<TuyauProvider client={tuyauClient}>
			<ColorSchemeScript />
			<MantineProvider theme={customTheme}>
				<ModalsProvider>{children}</ModalsProvider>
			</MantineProvider>
		</TuyauProvider>
	);
}
