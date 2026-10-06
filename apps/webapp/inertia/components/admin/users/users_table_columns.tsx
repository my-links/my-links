import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';

import { UserIdentity } from '~/components/common/user_identity';
import { UserBadgeRole } from '~/components/common/user_badge_role';
import { UserDateCell } from '~/components/admin/users/user_date_cell';
import { AccountActions } from '~/components/admin/users/account_actions';
import { UserCountBadge } from '~/components/admin/users/user_count_badge';
import { AuthMethodsCell } from '~/components/admin/users/auth_methods_cell';
import type { DataTableColumn } from '~/components/common/data_table/data_table';
import { PendingDeletionBadge } from '~/components/admin/users/pending_deletion_badge';
import { EmailVerificationBadge } from '~/components/admin/users/email_verification_badge';

export type UserWithCounters = Data.User.Variants['withCounters'];

const COUNT_CELL_CLASS_NAME =
	'px-6 py-4 text-sm text-gray-900 dark:text-white text-center';
const DATE_CELL_CLASS_NAME =
	'px-6 py-4 text-sm text-gray-600 dark:text-gray-400';

export const USERS_TABLE_COLUMNS: Array<DataTableColumn<UserWithCounters>> = [
	{
		key: 'fullname',
		header: <Trans>Name</Trans>,
		sortKey: 'fullname',
		cellClassName:
			'px-6 py-4 text-sm font-medium text-gray-900 dark:text-white',
		render: (user) => <UserIdentity fullname={user.fullname} />,
	},
	{
		key: 'role',
		header: <Trans>Role</Trans>,
		sortKey: 'isAdmin',
		cellClassName: 'px-6 py-4',
		render: (user) => <UserBadgeRole user={user} />,
	},
	{
		key: 'emailVerifiedAt',
		header: <Trans>Email</Trans>,
		sortKey: 'emailVerifiedAt',
		cellClassName: 'px-6 py-4',
		render: (user) => (
			<div className="flex flex-col items-start gap-1.5">
				<EmailVerificationBadge emailVerifiedAt={user.emailVerifiedAt} />
				<PendingDeletionBadge
					pendingDeletionAt={user.pendingDeletionAt}
					requestedByAdmin={user.pendingDeletionRequestedByAdmin}
				/>
			</div>
		),
	},
	{
		key: 'authMethods',
		header: <Trans>Sign-in methods</Trans>,
		cellClassName: 'px-6 py-4',
		render: (user) => <AuthMethodsCell authMethods={user.authMethods} />,
	},
	{
		key: 'collectionsCount',
		header: <Trans>Collections</Trans>,
		sortKey: 'collectionsCount',
		cellClassName: COUNT_CELL_CLASS_NAME,
		render: (user) => (
			<UserCountBadge icon="i-mdi-folder" count={user.collectionsCount} />
		),
	},
	{
		key: 'followedCollectionsCount',
		header: <Trans>Followed</Trans>,
		sortKey: 'followedCollectionsCount',
		cellClassName: COUNT_CELL_CLASS_NAME,
		render: (user) => (
			<UserCountBadge icon="i-mdi-star" count={user.followedCollectionsCount} />
		),
	},
	{
		key: 'linksCount',
		header: <Trans>Links</Trans>,
		sortKey: 'linksCount',
		cellClassName: COUNT_CELL_CLASS_NAME,
		render: (user) => (
			<UserCountBadge icon="i-mdi-link" count={user.linksCount} />
		),
	},
	{
		key: 'createdAt',
		header: <Trans>Created at</Trans>,
		sortKey: 'createdAt',
		cellClassName: DATE_CELL_CLASS_NAME,
		render: (user) => <UserDateCell date={user.createdAt} />,
	},
	{
		key: 'lastSeenAt',
		header: <Trans>Last seen at</Trans>,
		sortKey: 'lastSeenAt',
		cellClassName: DATE_CELL_CLASS_NAME,
		render: (user) => <UserDateCell date={user.lastSeenAt} />,
	},
	{
		key: 'lastLoginAt',
		header: <Trans>Last sign-in</Trans>,
		sortKey: 'lastLoginAt',
		cellClassName: DATE_CELL_CLASS_NAME,
		render: (user) => <UserDateCell date={user.lastLoginAt} />,
	},
	{
		key: 'actions',
		header: <Trans>Actions</Trans>,
		cellClassName: 'px-6 py-4',
		render: (user) => <AccountActions account={user} />,
	},
];
