import { Group, Text } from '@mantine/core';

export const ComboListItem = ({
	emoji,
	label,
}: {
	emoji: React.ReactNode;
	label: string;
}) => (
	<Group gap="xs" align="center">
		{emoji}
		<Text fz="sm" fw={500}>
			{label}
		</Text>
	</Group>
);
