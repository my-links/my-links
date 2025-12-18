import { Button, Drawer, Portal, rem, Text } from '@mantine/core';
import { useDisclosure, useHeadroom } from '@mantine/hooks';
import { Trans } from '@lingui/react/macro';
import { Trans as TransComponent } from '@lingui/react';
import { CollectionFavoriteItem } from '~/components/dashboard/collection/item/collection_favorite_item';
import { useCollections } from '~/hooks/collections/use_collections';
import { CollectionItem } from './item/collection_item';

export function MobileCollectionList() {
	const [opened, handler] = useDisclosure();
	const collections = useCollections();
	const pinned = useHeadroom({ fixedAt: 0 });

	return (
		<>
			<Drawer
				opened={opened}
				onClose={handler.close}
				title={
					<TransComponent
						id="common:collection.collections"
						message="Collections"
						values={{ count: collections.length }}
					/>
				}
			>
				<CollectionFavoriteItem />
				{collections.map((collection) => (
					<CollectionItem collection={collection} />
				))}
			</Drawer>
			<Portal>
				<Button
					onClick={handler.open}
					variant="outline"
					size="xs"
					style={{
						position: 'fixed',
						left: '50%',
						bottom: pinned ? rem(16) : rem(-100),
						width: `calc(100% - ${rem(16)} * 2)`,
						backgroundColor: 'var(--mantine-color-body)',
						transition: 'all 0.2s ease-in-out',
						transform: 'translateX(-50%)',
					}}
				>
					<div
						className="i-tabler-folder"
						style={{ width: '18px', height: '18px' }}
					/>
					<Text ml={4}>
						<TransComponent
							id="common:collection.collections"
							message="Collections"
							values={{ count: collections.length }}
						/>
					</Text>
				</Button>
			</Portal>
		</>
	);
}
