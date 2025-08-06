import { api } from '#adonis/api';
import { PageProps } from '@adonisjs/inertia/types';
import { router, usePage } from '@inertiajs/react';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/spotlight/styles.css';
import { createTuyau } from '@tuyau/client';
import { TuyauProvider } from '@tuyau/inertia/react';
import dayjs from 'dayjs';
import { ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/index.css';

const TRANSITION_IN_CLASS = '__transition_fadeIn';
const TRANSITION_OUT_CLASS = '__transition_fadeOut';

export function BaseLayout({ children }: { children: ReactNode }) {
	const { i18n } = useTranslation();
	dayjs.locale(i18n.language);
	const { props } = usePage<PageProps & { appBaseUrl: string }>();

	const tuyauClient = createTuyau({
		api,
		baseUrl: props.appBaseUrl,
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
			<MantineProvider>{children}</MantineProvider>
		</TuyauProvider>
	);
}
