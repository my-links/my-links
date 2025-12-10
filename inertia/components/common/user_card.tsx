import { Avatar, Group, Menu, Text, UnstyledButton } from '@mantine/core';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { TbChevronRight } from 'react-icons/tb';
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

				{icon || <TbChevronRight size="1rem" />}
			</Group>
		</UnstyledButton>
	)
);

export function UserCard() {
	const { t } = useTranslation('common');
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
						{t('logout')}
					</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		)
	);
}
