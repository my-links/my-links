import { tuyau } from '~/lib/tuyau';
import { Link } from '~/types/app';

export const onFavorite = (
	linkId: Link['id'],
	isFavorite: boolean,
	cb: () => void
) => {
	tuyau
		.$route('link.toggle-favorite', {
			id: linkId.toString(),
		})
		.$put({
			favorite: isFavorite,
			params: { id: linkId.toString() },
		})
		.then(() => cb())
		.catch(console.error);
};
