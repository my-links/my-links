import { Flex, Text } from '@mantine/core';
import { ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LinkList } from '~/components/dashboard/link/list/link_list';
import { ContentLayout } from '~/layouts/content_layout';
import { useCollectionsSetter } from '~/stores/collection_store';
import type { CollectionWithLinks, PublicUser } from '~/types/app';

interface SharedPageProps {
	collection: CollectionWithLinks & { author: PublicUser };
}

function SharedPage({ collection }: SharedPageProps) {
	const { t } = useTranslation('common');
	const { setActiveCollection } = useCollectionsSetter();

	useEffect(() => {
		setActiveCollection(collection);
	}, []);

	return (
		<>
			<Flex direction="column">
				<Text size="xl">{collection.name}</Text>
				<Text size="sm" c="dimmed">
					{collection.description}
				</Text>
				<Flex justify="flex-end">
					<Text
						size="sm"
						c="dimmed"
						mt="md"
						mb="lg"
						dangerouslySetInnerHTML={{
							__html: t('collection.managed-by', {
								name: collection.author.fullname,
							}),
						}}
					/>
				</Flex>
				<LinkList hideMenu />
			</Flex>
		</>
	);
}

SharedPage.layout = (page: ReactNode) => <ContentLayout>{page}</ContentLayout>;
export default SharedPage;
