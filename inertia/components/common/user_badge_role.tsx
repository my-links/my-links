import { Badge } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { PublicUser, User } from '~/types/app';

interface UserBadgeRoleProps {
	user: User | PublicUser;
}

export function UserBadgeRole({ user }: UserBadgeRoleProps) {
	const { t } = useTranslation('common');
	return (
		<>
			{user.isAdmin ? (
				<Badge variant="light" color="red">
					{t('admin')}
				</Badge>
			) : (
				<Badge variant="light" color="green">
					{t('user')}
				</Badge>
			)}
		</>
	);
}
