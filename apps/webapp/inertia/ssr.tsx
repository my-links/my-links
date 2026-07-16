import ReactDOMServer from 'react-dom/server';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from '@adonisjs/inertia/helpers';

import { Locale } from '~/types/i18n';
import { dynamicActivate } from '~/i18n';
import { DEFAULT_LOCALE } from '~/consts/i18n';
import { DefaultLayout } from '~/layouts/default_layout';

export default async function render(page: any) {
	const locale: Locale = page.props?.locale ?? DEFAULT_LOCALE;
	await dynamicActivate(locale);
	return createInertiaApp({
		page,

		// @ts-ignore
		render: ReactDOMServer.renderToString,

		// @ts-ignore
		resolve: async (name) => {
			const page = await resolvePageComponent(
				`./pages/${name}.tsx`,
				import.meta.glob('./pages/**/*.tsx', { eager: true })
			);
			// @ts-ignore
			page.default.layout ??= (children: React.ReactElement) => (
				<DefaultLayout>{children}</DefaultLayout>
			);
			return page;
		},

		// @ts-ignore
		setup: ({ App, props }) => <App {...props} />,
	});
}
