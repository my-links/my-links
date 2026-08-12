import '@minimalstuff/ui/style.css';
import 'virtual:uno.css';
import '~/css/app.css';

import { i18n } from '@lingui/core';
import { usePage } from '@inertiajs/react';
import { useEffect, useMemo } from 'react';
import { I18nProvider } from '@lingui/react';
import { ModalProvider } from '@minimalstuff/ui';
import { PageProps } from '@adonisjs/inertia/types';
import { TuyauProvider } from '@adonisjs/inertia/react';

import { tuyauClient } from '~/lib/tuyau';
import { DEFAULT_LOCALE } from '~/consts/i18n';
import { dynamicActivate, type Locale } from '~/i18n';
import { usePageTransition } from '~/hooks/use_page_transition';
import { FlashMessages } from '~/components/common/flash_messages';
import { AnnouncementBanner } from '~/components/common/announcement_banner';

interface BaseLayoutProps {
	children: React.ReactNode;
}

export function BaseLayout({ children }: Readonly<BaseLayoutProps>) {
	const { props } = usePage<PageProps & { locale: Locale }>();

	usePageTransition({
		querySelector: '[data-page-transition]',
		ignorePatterns: [/^\/collections\/(favorites|inbox|\d+)$/],
	});

	const locale = useMemo(() => {
		return props.locale ?? DEFAULT_LOCALE;
	}, [props.locale]);

	useEffect(() => {
		if (i18n.locale !== locale) {
			void dynamicActivate(locale);
		}
	}, [locale]);

	return (
		<I18nProvider i18n={i18n}>
			<TuyauProvider client={tuyauClient}>
				<ModalProvider />
				<AnnouncementBanner />
				<FlashMessages />
				{children}
			</TuyauProvider>
		</I18nProvider>
	);
}
