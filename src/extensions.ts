import { Response } from '@adonisjs/core/http';
import { route } from '@izzyjs/route/client';
import { RouteName } from '@izzyjs/route/types';

type IzzyRouteOptions = {
	params?: Record<string, any>; //Params<Name>;
	qs?: Record<string, any>;
	prefix?: string;
};

declare module '@adonisjs/core/http' {
	export interface Response {
		redirectToNamedRoute: (
			routeName: RouteName,
			options?: IzzyRouteOptions
		) => void;
	}
}

Response.macro(
	'redirectToNamedRoute',
	function (this: Response, routeName, options) {
		// TODO: fix this
		// @ts-ignore
		const current = route(routeName, options);
		this.redirect().toRoute(current.url, current.params, {
			qs: current.qs,
			disableRouteLookup: true,
		});
	}
);
