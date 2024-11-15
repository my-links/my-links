import { resolvePageComponent } from '@adonisjs/inertia/helpers';
import { createInertiaApp } from '@inertiajs/react';
import { isSSREnableForPage } from 'config-ssr';
import 'dayjs/locale/en';
import 'dayjs/locale/fr';
import { createRoot, hydrateRoot } from 'react-dom/client';
import '../i18n/index';

const appName = import.meta.env.VITE_APP_NAME || 'MyLinks';

createInertiaApp({
	progress: { color: '#5474B4' },

	title: (title) => `${appName}${title && ` - ${title}`}`,

	resolve: (name) => {
		return resolvePageComponent(
			`../pages/${name}.tsx`,
			import.meta.glob('../pages/**/*.tsx')
		);
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
