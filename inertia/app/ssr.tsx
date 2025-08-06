import { createInertiaApp } from '@inertiajs/react';
import ReactDOMServer from 'react-dom/server';
import DefaultLayout from '~/layouts/default_layout';

export default function render(page: any) {
	return createInertiaApp({
		page,
		render: ReactDOMServer.renderToString,
		resolve: (name) => {
			const pages = import.meta.glob('../pages/**/*.tsx', { eager: true });
			let pageComponent: any = pages[`../pages/${name}.tsx`];
			pageComponent.default.layout =
				pageComponent?.default?.layout ||
				((pageChildren: any) => <DefaultLayout children={pageChildren} />);
			return pageComponent;
		},
		setup: ({ App, props }) => <App {...props} />,
	});
}
