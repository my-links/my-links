import { Flex, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { LinkList } from '~/components/dashboard/link/list/link_list';
import type { CollectionWithLinks, PublicUser } from '~/types/app';

interface SharedPageProps {
	activeCollection: CollectionWithLinks & { author: PublicUser };
}

export default function SharedPage({ activeCollection }: SharedPageProps) {
	const { t } = useTranslation('common');
	return (
		<>
			<Flex direction="column">
				<Text size="xl">{activeCollection.name}</Text>
				<Text size="sm" c="dimmed">
					{activeCollection.description}
				</Text>
				<Flex justify="flex-end">
					<Text
						size="sm"
						c="dimmed"
						mt="md"
						mb="lg"
						dangerouslySetInnerHTML={{
							__html: t('collection.managed-by', {
								name: activeCollection.author.fullname,
							}),
						}}
					/>
				</Flex>
				<LinkList hideMenu />
			</Flex>
		</>
	);
}
