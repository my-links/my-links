import { Visibility } from '#enums/visibility';
import { Link } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import {
	ActionIcon,
	AppShell,
	Badge,
	Burger,
	Flex,
	Group,
	Menu,
	Text,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { GoPencil } from 'react-icons/go';
import { IoIosAddCircleOutline } from 'react-icons/io';
import { IoTrashOutline } from 'react-icons/io5';
import { ShareCollection } from '~/components/share/share_collection';
import { appendCollectionId } from '~/lib/navigation';
import { useActiveCollection } from '~/stores/collection_store';

interface DashboardHeaderProps {
	navbar: {
		opened: boolean;
		toggle: () => void;
	};
	aside: {
		opened: boolean;
		toggle: () => void;
	};
}
export function DashboardHeader({ navbar, aside }: DashboardHeaderProps) {
	const { t } = useTranslation('common');
	const { activeCollection } = useActiveCollection();
	return (
		<AppShell.Header style={{ display: 'flex', alignItems: 'center' }}>
			<Group justify="space-between" px="md" flex={1}>
				<Group h="100%">
					<Burger
						opened={navbar.opened}
						onClick={navbar.toggle}
						hiddenFrom="sm"
						size="sm"
					/>
					<Flex direction="column">
						<Text lineClamp={1}>
							{activeCollection?.name}{' '}
							{activeCollection?.visibility === Visibility.PUBLIC && (
								<Badge variant="light">{t('visibility.public')}</Badge>
							)}
						</Text>
						{activeCollection?.description && (
							<Text c="dimmed" size="sm">
								{activeCollection.description}
							</Text>
						)}
					</Flex>
				</Group>
				<Group>
					<ShareCollection />

					<Menu withinPortal shadow="md" width={225}>
						<Menu.Target>
							<ActionIcon variant="subtle" color="var(--mantine-color-text)">
								<BsThreeDotsVertical />
							</ActionIcon>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Item
								component={Link}
								href={appendCollectionId(
									route('link.create-form').path,
									activeCollection?.id
								)}
								leftSection={<IoIosAddCircleOutline />}
								color="blue"
							>
								{t('link.create')}
							</Menu.Item>
							<Menu.Item
								component={Link}
								href={appendCollectionId(
									route('collection.edit-form').path,
									activeCollection?.id
								)}
								leftSection={<GoPencil />}
								color="blue"
							>
								{t('collection.edit')}
							</Menu.Item>
							<Menu.Item
								component={Link}
								href={appendCollectionId(
									route('collection.delete-form').path,
									activeCollection?.id
								)}
								leftSection={<IoTrashOutline />}
								color="red"
							>
								{t('collection.delete')}
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>

					<Burger
						opened={aside.opened}
						onClick={aside.toggle}
						hiddenFrom="md"
						size="md"
					/>
				</Group>
			</Group>
		</AppShell.Header>
	);
}
