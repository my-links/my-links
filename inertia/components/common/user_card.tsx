import { Avatar, Group, Menu, Text, UnstyledButton } from '@mantine/core';
import { forwardRef } from 'react';
import { Trans } from '@lingui/react/macro';
import { useAuth } from '~/hooks/use_auth';
import { useTuyauRequired } from '~/hooks/use_tuyau_required';

interface UserButtonProps extends React.ComponentPropsWithoutRef<'button'> {
	image: string;
	name: string;
	icon?: React.ReactNode;
}

const UserButton = forwardRef<HTMLButtonElement, UserButtonProps>(
	({ image, name, icon, ...others }: UserButtonProps, ref) => (
		<UnstyledButton
			ref={ref}
			style={{
				color: 'var(--mantine-color-text)',
				borderRadius: 'var(--mantine-radius-sm)',
			}}
			{...others}
		>
			<Group>
				<Avatar
					src={image}
					radius="xl"
					imageProps={{ referrerPolicy: 'no-referrer' }}
				/>

				<div style={{ flex: 1 }}>
					<Text size="sm" fw={500}>
						{name}
					</Text>
				</div>

				{icon || (
					<div
						className="i-tabler-chevron-right"
						style={{ width: '1rem', height: '1rem' }}
					/>
				)}
			</Group>
		</UnstyledButton>
	)
);

export function UserCard() {
	const { user, isAuthenticated } = useAuth();
	const tuyau = useTuyauRequired();

	return (
		isAuthenticated &&
		user && (
			<Menu withArrow>
				<Menu.Target>
					<UserButton image={user.avatarUrl} name={user.fullname} />
				</Menu.Target>
				<Menu.Dropdown>
					<Menu.Item component="a" href={tuyau.$route('auth.logout').path}>
						<Trans>Logout</Trans>
					</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		)
	);
}
