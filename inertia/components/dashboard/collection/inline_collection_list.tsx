import { router } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import { Chip, Group, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useActiveCollection } from '~/hooks/collections/use_active_collection';
import { useCollections } from '~/hooks/collections/use_collections';
import { appendCollectionId } from '~/lib/navigation';

export function InlineCollectionList() {
	const { t } = useTranslation();
	const collections = useCollections();
	const activeCollection = useActiveCollection();

	const handleCollectionChange = (value?: string) => {
		if (value) {
			router.visit(appendCollectionId(route('dashboard').path, Number(value)));
			return;
		}
		router.visit(route('dashboard').path);
	};

	const fields = [
		{
			label: t('common:favorite'),
			value: 'favorite',
		},
		...collections.map((c) => ({
			label: (
				<Group gap="xs" wrap="nowrap">
					<>{c.name}</>
					<Text size="xs" c="dimmed">
						{c.links.length}
					</Text>
				</Group>
			),
			value: c.id.toString(),
		})),
	];

	return (
		<Group gap="xs" w="100%">
			{fields.map((field) => (
				<Chip
					key={field.value}
					checked={
						activeCollection?.id
							? activeCollection.id === Number(field.value)
							: field.value === 'favorite'
					}
					variant="light"
					onClick={() => handleCollectionChange(field.value)}
				>
					{field.label}
				</Chip>
			))}
		</Group>
	);
}
