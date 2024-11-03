import { AppShell, Burger, Group, ScrollArea, Text } from '@mantine/core';
import CollectionList from '~/mantine/components/dashboard/collection/list/collection_list';

interface DashboardAsideProps {
	isOpen: boolean;
	toggle: () => void;
}

export const DashboardAside = ({ isOpen, toggle }: DashboardAsideProps) => (
	<AppShell.Aside p="md">
		<Group justify="space-between" hiddenFrom="md" mb="md">
			<Text>Collections</Text>
			<Burger opened={isOpen} onClick={toggle} hiddenFrom="md" size="md" />
		</Group>
		<AppShell.Section grow component={ScrollArea}>
			<CollectionList />
		</AppShell.Section>
	</AppShell.Aside>
);
