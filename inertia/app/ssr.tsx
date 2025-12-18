import { DEFAULT_LOCALE } from '#shared/consts/i18n';
import { Locale } from '#shared/types/i18n';
import { createInertiaApp } from '@inertiajs/react';
import ReactDOMServer from 'react-dom/server';
import { dynamicActivate } from '~/i18n';
import { DefaultLayout } from '~/layouts/default_layout';

export default async function render(page: any) {
	const locale: Locale = page.props?.locale ?? DEFAULT_LOCALE;
	await dynamicActivate(locale);

	return createInertiaApp({
		page,
		render: ReactDOMServer.renderToString,
		resolve: (name) => {
			const pages = import.meta.glob('../pages/**/*.tsx', { eager: true });
			let pageComponent: any = pages[`../pages/${name}.tsx`];

			if (pageComponent?.default) {
				pageComponent.default.layout =
					pageComponent.default.layout ||
					((pageChildren: any) => <DefaultLayout children={pageChildren} />);
			}

			return pageComponent;
		},
		setup: ({ App, props }) => <App {...props} />,
	});
}
