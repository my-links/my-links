import { resolvePageComponent } from '@adonisjs/inertia/helpers';
import { Data } from '@generated/data';
import { createInertiaApp } from '@inertiajs/react';
import { isSSREnableForPage } from 'config-ssr';
import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { DEFAULT_LOCALE } from '~/consts/i18n';
import { PROJECT_NAME } from '~/consts/project';
import { DefaultLayout } from '~/layouts/default_layout';
import type { Locale } from '~/types/i18n';
import { dynamicActivate } from './i18n/index';

createInertiaApp({
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

	async setup({ el, App, props }) {
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
	},
});
