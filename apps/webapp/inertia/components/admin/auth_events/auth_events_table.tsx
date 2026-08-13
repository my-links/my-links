import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';
import { ClientOnly } from '@minimalstuff/ui';

import { formatDate } from '~/lib/format';
import { NaContent } from '~/components/common/na_content';
import { UserIdentity } from '~/components/common/user_identity';
import { DataTable } from '~/components/common/data_table/data_table';
import { AuthEventTypeBadge } from '~/components/admin/auth_events/auth_event_type_badge';

type AuthEvent = Data.AuthEvent;

interface AuthEventsTableProps {
	events: AuthEvent[];
}

export const AuthEventsTable = ({ events }: Readonly<AuthEventsTableProps>) => (
	<DataTable<AuthEvent>
		data={events}
		getRowKey={(event) => String(event.id)}
		minWidthClassName="min-w-[980px]"
		columns={[
			{
				key: 'createdAt',
				header: <Trans>When</Trans>,
				cellClassName: 'px-6 py-3 text-sm text-gray-600 dark:text-gray-400',
				render: (event) => (
					<ClientOnly>
						{event.createdAt ? formatDate(event.createdAt) : <NaContent />}
					</ClientOnly>
				),
			},
			{
				key: 'type',
				header: <Trans>Event</Trans>,
				cellClassName: 'px-6 py-3',
				render: (event) => <AuthEventTypeBadge type={event.type} />,
			},
			{
				key: 'fullname',
				header: <Trans>Account</Trans>,
				cellClassName:
					'px-6 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap',
				render: (event) => <UserIdentity fullname={event.fullname} />,
			},
			{
				key: 'actorFullname',
				header: <Trans>Done by</Trans>,
				cellClassName:
					'px-6 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap',
				render: (event) => <UserIdentity fullname={event.actorFullname} />,
			},
			{
				key: 'ip',
				header: <Trans>Address</Trans>,
				cellClassName:
					'px-6 py-3 text-sm font-mono text-gray-600 dark:text-gray-400',
				render: (event) => event.ip ?? <NaContent />,
			},
			{
				key: 'userAgent',
				header: <Trans>User agent</Trans>,
				cellClassName:
					'px-6 py-3 text-sm text-gray-500 dark:text-gray-500 max-w-xs truncate',
				render: (event) => event.userAgent ?? <NaContent />,
			},
		]}
		emptyState={
			<div className="flex flex-col items-center justify-center gap-2">
				<i className="i-mdi-history w-12 h-12 text-gray-300 dark:text-gray-600" />
				<p className="text-gray-500 dark:text-gray-400 font-medium">
					<Trans>Nothing has happened yet</Trans>
				</p>
			</div>
		}
	/>
);
