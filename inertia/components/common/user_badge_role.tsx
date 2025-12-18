import { UserWithCounters } from '#shared/types/dto';
import { Badge } from '@mantine/core';
import { Trans } from '@lingui/react/macro';

interface UserBadgeRoleProps {
	user: UserWithCounters;
}

export function UserBadgeRole({ user }: UserBadgeRoleProps) {
	return (
		<>
			{user.isAdmin ? (
				<Badge variant="light" color="red">
					<Trans>Admin</Trans>
				</Badge>
			) : (
				<Badge variant="light" color="green">
					<Trans>User</Trans>
				</Badge>
			)}
		</>
	);
}
