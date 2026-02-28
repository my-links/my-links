import type { ApiRouteName } from '#shared/types/index';
import { HttpResponse } from '@adonisjs/core/http';
import { urlFor } from '@adonisjs/core/services/url_builder';

type RouteOptions = {
	params?: Record<string, string | number>;
	qs?: Record<string, string | number>;
};

declare module '@adonisjs/core/http' {
	export interface HttpResponse {
		redirectToNamedRoute: (
			routeName: ApiRouteName,
			options?: RouteOptions
		) => void;
	}
}

HttpResponse.macro(
	'redirectToNamedRoute',
	function (this: HttpResponse, routeName, options) {
		const routeInfo = urlFor(routeName, { params: options?.params });
		this.redirect(routeInfo);
	}
);
