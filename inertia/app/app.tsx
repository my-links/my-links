import { resolvePageComponent } from '@adonisjs/inertia/helpers';
import { createInertiaApp } from '@inertiajs/react';
import { isSSREnableForPage } from 'config-ssr';
import 'dayjs/locale/en';
import 'dayjs/locale/fr';
import { createRoot, hydrateRoot } from 'react-dom/client';
import DefaultLayout from '~/layouts/default_layout';
import '../i18n/index';

const appName = import.meta.env.VITE_APP_NAME || 'MyLinks';

createInertiaApp({
	progress: { color: '#5474B4' },

	title: (title) => `${appName}${title && ` - ${title}`}`,

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

	setup({ el, App, props }) {
		const componentName = props.initialPage.component;
		const isSSREnabled = isSSREnableForPage(componentName);
		console.debug(`Page "${componentName}" SSR enabled: ${isSSREnabled}`);
		if (isSSREnabled) {
			hydrateRoot(el, <App {...props} />);
		} else {
			createRoot(el).render(<App {...props} />);
		}
	},
});
