import { TuyauProvider } from '@adonisjs/inertia/react';
import { PageProps } from '@adonisjs/inertia/types';
import { usePage } from '@inertiajs/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import '@minimalstuff/ui/style.css';
import { useEffect, useMemo } from 'react';
import 'virtual:uno.css';
import { ModalProvider } from '~/components/common/modal_provider';
import { DEFAULT_LOCALE } from '~/consts/i18n';
import '~/css/app.css';
import { usePageTransition } from '~/hooks/use_page_transition';
import { dynamicActivate } from '~/i18n';
import { tuyauClient } from '~/lib/tuyau';
import type { Locale } from '~/types/i18n';

interface BaseLayoutProps {
	children: React.ReactNode;
}

export function BaseLayout({ children }: Readonly<BaseLayoutProps>) {
	const { props } = usePage<PageProps & { locale: Locale }>();

	usePageTransition({
		querySelector: '[data-page-transition]',
		ignorePatterns: [/^\/collections\/(favorites|\d+)$/],
	});

	const locale = useMemo(() => {
		return props.locale ?? DEFAULT_LOCALE;
	}, [props.locale]);

	useEffect(() => {
		if (i18n.locale !== locale) {
			dynamicActivate(locale);
		}
	}, [locale]);

	return (
		<I18nProvider i18n={i18n}>
			<TuyauProvider client={tuyauClient}>
				<ModalProvider />
				{children}
			</TuyauProvider>
		</I18nProvider>
	);
}
