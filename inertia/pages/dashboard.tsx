import { Link } from '@inertiajs/react';
import {
	Box,
	Button,
	Divider,
	Group,
	Input,
	Stack,
	Text,
	Tooltip,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { CollectionList } from '~/components/dashboard/collection/collection_list';
import { InlineCollectionList } from '~/components/dashboard/collection/inline_collection_list';
import { MobileCollectionList } from '~/components/dashboard/collection/mobile_collection_list';
import { SharedCollectionCopyLink } from '~/components/dashboard/collection/shared_collection_copy_link';
import { LinkList } from '~/components/dashboard/link/list/link_list';
import { useActiveCollection } from '~/hooks/collections/use_active_collection';
import { useDisplayPreferences } from '~/hooks/use_display_preferences';
import { useIsMobile } from '~/hooks/use_is_mobile';
import { appendCollectionId } from '~/lib/navigation';
import { useRouteHelper } from '~/lib/route_helper';
import { Visibility } from '~/types/app';

export default function Dashboard() {
	const { t } = useTranslation();
	const { displayPreferences } = useDisplayPreferences();
	const activeCollection = useActiveCollection();
	const { route } = useRouteHelper();

	const isMobile = useIsMobile();
	const isFavorite = !activeCollection?.id;
	return (
		<Stack w="100%">
			<Group justify="space-between">
				<Tooltip label={t('coming-soon')}>
					<Input
						placeholder={t('search')}
						w={isMobile ? '100%' : '350px'}
						disabled
					/>
				</Tooltip>
				<Group>
					{activeCollection?.visibility === Visibility.PUBLIC && (
						<>
							<SharedCollectionCopyLink />
							<Divider orientation="vertical" />
						</>
					)}

					<Button
						variant="outline"
						component={Link}
						href={appendCollectionId(
							route('collection.create-form').path,
							activeCollection?.id
						)}
						size="xs"
					>
						{t('collection.create')}
					</Button>
					{!isFavorite && (
						<Button
							variant="outline"
							component={Link}
							href={appendCollectionId(
								route('collection.edit-form').path,
								activeCollection?.id
							)}
							size="xs"
						>
							{t('collection.edit')}
						</Button>
					)}

					<>
						<Divider orientation="vertical" />
						<Button
							variant="light"
							component={Link}
							href={appendCollectionId(
								route('link.create-form').path,
								activeCollection?.id
							)}
							size="xs"
						>
							{t('link.create')}
						</Button>
					</>
				</Group>
			</Group>
			{displayPreferences.collectionListDisplay === 'inline' && !isMobile && (
				<InlineCollectionList />
			)}
			<Group
				wrap="nowrap"
				align="flex-start"
				style={{ flexDirection: isMobile ? 'column-reverse' : 'row' }}
				flex={1}
				w="100%"
			>
				<Box w="100%">
					{activeCollection?.description && (
						<Text
							size="sm"
							c="dimmed"
							mb="md"
							style={{ wordBreak: 'break-word', whiteSpace: 'pre-line' }}
						>
							{activeCollection.description}
						</Text>
					)}
					<LinkList />
				</Box>
				{displayPreferences.collectionListDisplay === 'list' && !isMobile && (
					<CollectionList />
				)}
			</Group>
			{isMobile && <MobileCollectionList />}
		</Stack>
	);
}
