import React from 'react';
import { Data } from '@generated/data';
import { isSSREnableForPage } from 'config-ssr';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { resolvePageComponent } from '@adonisjs/inertia/helpers';

import type { Locale } from '~/types/i18n';
import { DEFAULT_LOCALE } from '~/consts/i18n';
import { dynamicActivate } from './i18n/index';
import { PROJECT_NAME } from '~/consts/project';
import { DefaultLayout } from '~/layouts/default_layout';

void createInertiaApp({
	progress: { color: 'var(--colors-blue-500)', delay: 50 },

	title: (title) => `${title && `${title} - `}${PROJECT_NAME}`,

	resolve: async (name) => {
		return resolvePageComponent(
			`./pages/${name}.tsx`,
			import.meta.glob('./pages/**/*.tsx'),
			(page: React.ReactElement<Data.SharedProps>) => (
				<DefaultLayout>{page}</DefaultLayout>
			)
		);
	},

	setup({ el, App, props }) {
		void (async () => {
			const componentName = props.initialPage.component;
			const isSSREnabled = isSSREnableForPage(componentName);
			console.debug(`Page "${componentName}" SSR enabled: ${isSSREnabled}`);

			const locale: Locale =
				(props.initialPage.props?.locale as Locale) ?? DEFAULT_LOCALE;

			await dynamicActivate(locale);

			if (isSSREnabled) {
				hydrateRoot(el, <App {...props} />);
			} else {
				createRoot(el).render(<App {...props} />);
			}
		})();
	},
});
