import { resolvePageComponent } from '@adonisjs/inertia/helpers';
import { Data } from '@generated/data';
import { createInertiaApp } from '@inertiajs/react';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { DEFAULT_LOCALE } from '~/consts/i18n';
import { dynamicActivate } from '~/i18n';
import { DefaultLayout } from '~/layouts/default_layout';
import { Locale } from '~/types/i18n';

export default async function render(page: any) {
	const locale: Locale = page.props?.locale ?? DEFAULT_LOCALE;
	await dynamicActivate(locale);
	return createInertiaApp({
		page,
		render: ReactDOMServer.renderToString,
		resolve: (name) => {
			return resolvePageComponent(
				`./pages/${name}.tsx`,
				import.meta.glob('./pages/**/*.tsx', { eager: true }),
				(page: React.ReactElement<Data.SharedProps>) => (
					<DefaultLayout>{page}</DefaultLayout>
				)
			);
		},
		setup: ({ App, props }) => <App {...props} />,
	});
}
