import { Avatar, Group, Menu, Text, UnstyledButton } from '@mantine/core';
import { forwardRef } from 'react';
import { TbChevronRight } from 'react-icons/tb';
import useUser from '~/hooks/use_user';

interface UserButtonProps extends React.ComponentPropsWithoutRef<'button'> {
	image: string;
	name: string;
	email: string;
	icon?: React.ReactNode;
}

const UserButton = forwardRef<HTMLButtonElement, UserButtonProps>(
	({ image, name, email, icon, ...others }: UserButtonProps, ref) => (
		<UnstyledButton
			ref={ref}
			style={{
				color: 'var(--mantine-color-text)',
				borderRadius: 'var(--mantine-radius-sm)',
			}}
			{...others}
		>
			<Group>
				<Avatar src={image} radius="xl" />

				<div style={{ flex: 1 }}>
					<Text size="sm" fw={500}>
						{name}
					</Text>

					<Text c="dimmed" size="xs">
						{email}
					</Text>
				</div>

				{icon || <TbChevronRight size="1rem" />}
			</Group>
		</UnstyledButton>
	)
);

export function MantineUserCard() {
	const { user, isAuthenticated } = useUser();
	return (
		isAuthenticated && (
			<Menu withArrow>
				<Menu.Target>
					<UserButton
						image={user.avatarUrl}
						name={user.fullname}
						email={user.email}
					/>
				</Menu.Target>
				<Menu.Dropdown>
					<Menu.Item>Logout</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		)
	);
}
