import { isSSREnableForPage } from 'config-ssr';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { resolvePageComponent } from '@adonisjs/inertia/helpers';

import { DEFAULT_LOCALE } from '~/consts/i18n';
import { PROJECT_NAME } from '~/consts/project';
import { dynamicActivate, type Locale } from '~/i18n';
import { DefaultLayout } from '~/layouts/default_layout';

void createInertiaApp({
	progress: { color: 'var(--colors-blue-500)', delay: 50 },

	title: (title) => `${title && `${title} — `}${PROJECT_NAME}`,

	// @ts-ignore
	resolve: async (name) => {
		const page = await resolvePageComponent(
			`./pages/${name}.tsx`,
			import.meta.glob('./pages/**/*.tsx')
		);
		// @ts-ignore
		page.default.layout ??= (children: React.ReactElement) => (
			<DefaultLayout>{children}</DefaultLayout>
		);
		return page;
	},

	// @ts-ignore
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
