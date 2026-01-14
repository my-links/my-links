import { PRIMARY_COLOR, PROJECT_NAME } from '#config/project';
import { DEFAULT_LOCALE } from '#shared/consts/i18n';
import { Locale } from '#shared/types/i18n';
import { resolvePageComponent } from '@adonisjs/inertia/helpers';
import { createInertiaApp } from '@inertiajs/react';
import { isSSREnableForPage } from 'config-ssr';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { DefaultLayout } from '~/layouts/default_layout';
import { dynamicActivate } from '../i18n/index';

createInertiaApp({
	progress: { color: PRIMARY_COLOR },

	title: (title) => `${title && `${title} - `}${PROJECT_NAME}`,

	resolve: async (name) => {
		const currentPage: any = await resolvePageComponent(
			`../pages/${name}.tsx`,
			import.meta.glob('../pages/**/*.tsx')
		);

		if (currentPage?.default) {
			currentPage.default.layout =
				currentPage.default.layout ||
				((p: any) => <DefaultLayout children={p} />);
		}

		return currentPage;
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
