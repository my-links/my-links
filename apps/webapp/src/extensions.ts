import { HttpResponse } from '@adonisjs/core/http';
import type { RoutesList } from '@adonisjs/core/types/http';
import { urlFor } from '@adonisjs/core/services/url_builder';

type RouteOptions = {
	params?: Record<string, string | number>;
	qs?: Record<string, string | number>;
};

declare module '@adonisjs/core/http' {
	export interface HttpResponse {
		redirectToNamedRoute: (
			routeName: keyof RoutesList['GET'],
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
