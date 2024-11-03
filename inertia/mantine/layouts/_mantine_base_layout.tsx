import { router } from '@inertiajs/react';
import { ColorSchemeScript, createTheme, MantineProvider } from '@mantine/core';
import dayjs from 'dayjs';
import { ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import '@mantine/core/styles.css';
import '@mantine/spotlight/styles.css';
import '../../styles/index.css';

const theme = createTheme({});
const TRANSITION_IN_CLASS = '__transition_fadeIn';
const TRANSITION_OUT_CLASS = '__transition_fadeOut';

export default function BaseLayout({ children }: { children: ReactNode }) {
	const { i18n } = useTranslation();
	dayjs.locale(i18n.language);

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
		flipClass(TRANSITION_IN_CLASS, TRANSITION_OUT_CLASS);

		router.on(
			'start',
			(event) =>
				canTransition(currentLocation, event.detail.visit.url) &&
				flipClass(TRANSITION_OUT_CLASS, TRANSITION_IN_CLASS)
		);
		router.on(
			'finish',
			(event) =>
				canTransition(currentLocation, event.detail.visit.url) &&
				flipClass(TRANSITION_IN_CLASS, TRANSITION_OUT_CLASS)
		);
	}, []);

	return (
		<>
			<ColorSchemeScript />
			<MantineProvider theme={theme}>{children}</MantineProvider>
		</>
	);
}
