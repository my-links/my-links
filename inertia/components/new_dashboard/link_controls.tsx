import {
	Link,
	LinkWithCollection,
	CollectionWithLinks,
} from '#shared/types/dto';
import { usePage, router, Link as InertiaLink } from '@inertiajs/react';
import { PageProps } from '@adonisjs/inertia/types';
import { Trans } from '@lingui/react/macro';
import { Trans as TransComponent } from '@lingui/react';
import clsx from 'clsx';
import { MouseEvent, useState } from 'react';
import { useTuyauRequired } from '~/hooks/use_tuyau_required';
import { onFavorite } from '~/lib/favorite';
import { appendCollectionId } from '~/lib/navigation';
import { EditLinkModal } from './modals/edit_link_modal';
import { DeleteLinkModal } from './modals/delete_link_modal';
import { Modal } from '~/components/common/modal';

interface LinkControlsProps {
	link: Link;
	showGoToCollection?: boolean;
}

interface PagePropsWithCollections extends PageProps {
	collections: CollectionWithLinks[];
	activeCollection?: CollectionWithLinks | null;
}

export function LinkControls({
	link,
	showGoToCollection = false,
}: LinkControlsProps) {
	const { props } = usePage<PagePropsWithCollections>();
	const tuyau = useTuyauRequired();
	const [isOpen, setIsOpen] = useState(false);
	const [editLinkOpen, setEditLinkOpen] = useState(false);
	const [deleteLinkOpen, setDeleteLinkOpen] = useState(false);

	const getLinkWithCollection = (): LinkWithCollection | null => {
		const collection = props.collections.find(
			(c) => c.id === link.collectionId
		);
		if (!collection) return null;
		return {
			...link,
			collection: {
				id: collection.id,
				name: collection.name,
				description: collection.description,
				visibility: collection.visibility,
				authorId: collection.authorId,
				createdAt: collection.createdAt,
				updatedAt: collection.updatedAt,
			},
		};
	};

	const handleEditLink = () => {
		setIsOpen(false);
		setEditLinkOpen(true);
	};

	const handleDeleteLink = () => {
		setIsOpen(false);
		setDeleteLinkOpen(true);
	};

	const onFavoriteCallback = () => {
		const routeInfo = tuyau.$route('link.toggle-favorite', {
			id: link.id.toString(),
		});
		if (!routeInfo) {
			throw new Error('Route link.toggle-favorite not found');
		}
		router.put(routeInfo.path);
	};

	const handleStopPropagation = (event: MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		event.stopPropagation();
	};

	return (
		<div className="relative" onClick={(e) => e.stopPropagation()}>
			<button
				onClick={(e) => {
					handleStopPropagation(e);
					setIsOpen(!isOpen);
				}}
				className="p-1 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
				aria-label="Menu"
			>
				<div className="i-mdi-dots-vertical w-5 h-5" />
			</button>
			{isOpen && (
				<>
					<div
						className="fixed inset-0 z-10"
						onClick={() => setIsOpen(false)}
					/>
					<div className="absolute right-0 top-full mt-1 w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50 z-999 py-1">
						{showGoToCollection && (
							<InertiaLink
								href={appendCollectionId(
									tuyau.$route('dashboard').path,
									link.collectionId
								)}
								className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
								onClick={() => setIsOpen(false)}
							>
								<div className="i-fa6-regular-eye w-4 h-4" />
								<Trans>Go to collection</Trans>
							</InertiaLink>
						)}
						{'favorite' in link && (
							<button
								onClick={() => {
									onFavorite(
										tuyau,
										link.id,
										!link.favorite,
										onFavoriteCallback
									);
									setIsOpen(false);
								}}
								className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
							>
								<div
									className={clsx(
										'w-4 h-4',
										link.favorite ? 'i-mdi-favorite' : 'i-mdi-favorite-border'
									)}
								/>
								{link.favorite ? (
									<Trans>Remove from favorites</Trans>
								) : (
									<Trans>Add to favorites</Trans>
								)}
							</button>
						)}
						<button
							onClick={handleEditLink}
							className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
						>
							<div className="i-octicon-pencil w-4 h-4" />
							<Trans>Edit a link</Trans>
						</button>
						<button
							onClick={handleDeleteLink}
							className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
						>
							<div className="i-ion-trash-outline w-4 h-4" />
							<Trans>Delete a link</Trans>
						</button>
					</div>
				</>
			)}

			{(() => {
				const linkWithCollection = getLinkWithCollection();
				if (!linkWithCollection) return null;

				return (
					<>
						<Modal
							isOpen={editLinkOpen}
							onClose={() => setEditLinkOpen(false)}
							title={
								<TransComponent id="common:link.edit" message="Edit a link" />
							}
						>
							<EditLinkModal
								collections={props.collections}
								link={linkWithCollection}
								onClose={() => setEditLinkOpen(false)}
							/>
						</Modal>

						<Modal
							isOpen={deleteLinkOpen}
							onClose={() => setDeleteLinkOpen(false)}
							title={
								<TransComponent
									id="common:link.delete"
									message="Delete a link"
								/>
							}
						>
							<DeleteLinkModal
								link={linkWithCollection}
								onClose={() => setDeleteLinkOpen(false)}
							/>
						</Modal>
					</>
				);
			})()}
		</div>
	);
}
