import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { CollectionWithLinks, Link, LinkWithCollection } from '~/types/app';

type Collections = CollectionWithLinks[];

interface CollectionStore {
	collections: Collections;
	_setCollections: (collections: Collections) => void;

	activeCollection: CollectionWithLinks | null;
	setActiveCollection: (collection: CollectionWithLinks) => void;

	favorites: LinkWithCollection[];
	toggleFavorite: (link: Link['id']) => void;
}

export const useCollectionStore = create<CollectionStore>((set, get) => ({
	collections: [],
	_setCollections: (collections) => {
		const favorites = getFavoriteLinks(collections);
		set({ collections, favorites });
	},

	activeCollection: null,
	setActiveCollection: (collection) => set({ activeCollection: collection }),

	favorites: [],
	toggleFavorite: (linkId) => {
		const { collections } = get();
		let linkIndex = 0;
		const collectionIndex = collections.findIndex(({ links }) => {
			const lIndex = links.findIndex((l) => l.id === linkId);
			if (lIndex !== -1) {
				linkIndex = lIndex;
			}
			return lIndex !== -1;
		});

		const collectionLink = collections[collectionIndex].links[linkIndex];
		const collectionsCopy = [...collections];
		collectionsCopy[collectionIndex].links[linkIndex] = {
			...collectionLink,
			favorite: !collectionLink.favorite,
		};

		set({
			collections: collectionsCopy,
			activeCollection: collectionsCopy[collectionIndex],
			favorites: getFavoriteLinks(collectionsCopy),
		});
	},
}));

export const useActiveCollection = () =>
	useCollectionStore(
		useShallow((state) => ({
			activeCollection: state.activeCollection,
			setActiveCollection: state.setActiveCollection,
		}))
	);

export const useCollections = () =>
	useCollectionStore(
		useShallow((state) => ({ collections: state.collections }))
	);

export const useFavorites = () =>
	useCollectionStore(
		useShallow((state) => ({
			favorites: state.favorites,
			toggleFavorite: state.toggleFavorite,
		}))
	);

export function useCollectionsSetter() {
	const { _setCollections, setActiveCollection } = useCollectionStore();
	return { _setCollections, setActiveCollection };
}

function getFavoriteLinks(collections: Collections) {
	return collections.reduce((acc, collection) => {
		collection.links.forEach((link) => {
			if (link.favorite) {
				const newLink: LinkWithCollection = { ...link, collection };
				acc.push(newLink);
			}
		});
		return acc;
	}, [] as LinkWithCollection[]);
}
