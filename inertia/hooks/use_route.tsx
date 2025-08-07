import { ApiRouteName } from '#shared/types/index';
import { useTuyau } from '@tuyau/inertia/react';
import { buildUrl } from '~/lib/navigation';

interface TuyauRoute {
	route: ApiRouteName;
	params?: Record<string, string>; // TODO: add type
}

interface NonTuyauRoute {
	href: string;
}

type UseRouteProps = TuyauRoute | NonTuyauRoute;

type TuyauReturn = {
	url: string;
	method: string;
};

type NonTuyauReturn = {
	url: string;
};

type UseRouteReturn<T extends UseRouteProps> = T extends TuyauRoute
	? TuyauReturn
	: NonTuyauReturn;

export const useRoute = <T extends UseRouteProps>(
	props: T
): UseRouteReturn<T> => {
	const tuyau = useTuyau();
	if ('href' in props) {
		return {
			url: props.href,
		} as UseRouteReturn<T>;
	}

	const route = tuyau?.$route(props.route, props.params);
	if (!route) {
		throw new Error(`Route ${props.route} not found`);
	}

	return {
		url: buildUrl(route.path, props.params ?? {}),
		method: route.method,
	} as UseRouteReturn<T>;
};
