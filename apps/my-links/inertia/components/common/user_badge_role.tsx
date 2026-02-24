import { UserWithCounters } from '#shared/types/dto';
import { Trans } from '@lingui/react/macro';

interface UserBadgeRoleProps {
	user: UserWithCounters;
}

export const UserBadgeRole = ({ user }: UserBadgeRoleProps) => (
	<span
		className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
			user.isAdmin
				? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
				: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
		}`}
	>
		{user.isAdmin ? <Trans>Admin</Trans> : <Trans>User</Trans>}
	</span>
);
