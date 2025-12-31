import { api } from '#adonis/api';
import { DEFAULT_LOCALE } from '#shared/consts/i18n';
import { Locale } from '#shared/types/i18n';
import { PageProps } from '@adonisjs/inertia/types';
import { usePage } from '@inertiajs/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { createTuyau } from '@tuyau/client';
import { TuyauProvider } from '@tuyau/inertia/react';
import { ReactNode, useEffect, useMemo } from 'react';
import 'virtual:uno.css';
import '~/css/app.css';
import { usePageTransition } from '~/hooks/use_page_transition';
import { dynamicActivate } from '~/i18n';

const appUrl = import.meta.env.VITE_APP_URL;

export function BaseLayout({ children }: { children: ReactNode }) {
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
			<TuyauProvider client={tuyauClient}>{children}</TuyauProvider>
		</I18nProvider>
	);
}
