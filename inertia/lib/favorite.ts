import { Link } from '#shared/types/dto';
import type { TuyauClient } from '@tuyau/inertia/react';
import { makeRequest } from '~/lib/request';

export const onFavorite = (
	tuyau: TuyauClient,
	linkId: Link['id'],
	isFavorite: boolean,
	cb: () => void
) => {
	const routeInfo = tuyau.$route('link.toggle-favorite', {
		id: linkId.toString(),
	});
	if (!routeInfo) {
		throw new Error('Route link.toggle-favorite not found');
	}
	makeRequest({
		url: routeInfo.path,
		method: routeInfo.method,
		body: {
			favorite: isFavorite,
		},
	})
		.then(() => cb())
		.catch(console.error);
};
