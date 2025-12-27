import { SharedCollection } from '#shared/types/dto';
import { Trans as TransComponent } from '@lingui/react';
import { Flex, Text } from '@mantine/core';
import { LinkList } from '~/components/dashboard/link_list';

interface SharedPageProps {
	activeCollection: SharedCollection;
}

export default function SharedPage({ activeCollection }: SharedPageProps) {
	return (
		<>
			<Flex direction="column">
				<Text size="xl">{activeCollection.name}</Text>
				<Text size="sm" c="dimmed">
					{activeCollection.description}
				</Text>
				<Flex justify="flex-end">
					<Text size="sm" c="dimmed" mt="md" mb="lg">
						<TransComponent
							id="common:collection.managed-by"
							message="Collection managed by <b>{{name}}</b>"
							values={{ name: activeCollection.author.fullname }}
							components={{
								b: <b />,
							}}
						/>
					</Text>
				</Flex>
				<LinkList />
			</Flex>
		</>
	);
}
