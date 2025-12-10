import { Link } from '#shared/types/dto';
import { route } from '@izzyjs/route/client';
import { makeRequest } from '~/lib/request';

export const onFavorite = (
	linkId: Link['id'],
	isFavorite: boolean,
	cb: () => void
) => {
	const { url, method } = route('link.toggle-favorite', {
		params: { id: linkId.toString() },
	});
	makeRequest({
		url,
		method,
		body: {
			favorite: isFavorite,
		},
	})
		.then(() => cb())
		.catch(console.error);
};
