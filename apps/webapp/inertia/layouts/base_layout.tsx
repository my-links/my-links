import '@minimalstuff/ui/style.css';
import 'virtual:uno.css';
import '~/css/app.css';

import { TuyauProvider } from '@adonisjs/inertia/react';
import type { PageProps } from '@adonisjs/inertia/types';
import { usePage } from '@inertiajs/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { ModalProvider } from '@minimalstuff/ui';
import { useEffect, useMemo } from 'react';

import { AnnouncementBanner } from '~/components/common/announcement_banner';
import { Toaster } from '~/components/common/toaster';
import { DEFAULT_LOCALE } from '~/consts/i18n';
import { useFlashToast } from '~/hooks/use_flash_toast';
import { usePageTransition } from '~/hooks/use_page_transition';
import { dynamicActivate, type Locale } from '~/i18n';
import { tuyauClient } from '~/lib/tuyau';

type BaseLayoutProps = {
	children: React.ReactNode;
};

export function BaseLayout({ children }: Readonly<BaseLayoutProps>) {
	const { props } = usePage<PageProps & { locale: Locale }>();

	useFlashToast();
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
				<Toaster />
				<AnnouncementBanner />
				{children}
			</TuyauProvider>
		</I18nProvider>
	);
}
