import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';

import { formatDate } from '~/lib/format';
import { NaContent } from '~/components/common/na_content';
import { ClientOnly } from '~/components/common/client_only';
import { UserIdentity } from '~/components/common/user_identity';
import { DataTable } from '~/components/common/data_table/data_table';
import { AuthEventTypeBadge } from '~/components/admin/auth_events/auth_event_type_badge';

type ActivityEvent = Data.ActivityEvent;

interface ActivityEventsTableProps {
	events: ActivityEvent[];
}

/**
 * `link #4102` / `collection #77` — an identifier, never a name. Resolving it
 * to real content is a separate decision this table does not make.
 */
function describeSubject(event: ActivityEvent): string {
	return `${event.subjectType} #${event.subjectId}`;
}

function describeMetadata(event: ActivityEvent) {
	if (!event.metadata) return <NaContent />;

	const entries = Object.entries(event.metadata);
	if (entries.length === 0) return <NaContent />;

	return entries.map(([key, value]) => `${key}: ${String(value)}`).join(', ');
}

export const ActivityEventsTable = ({
	events,
}: Readonly<ActivityEventsTableProps>) => (
	<DataTable<ActivityEvent>
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
				key: 'subject',
				header: <Trans>Subject</Trans>,
				cellClassName:
					'px-6 py-3 text-sm font-mono text-gray-900 dark:text-white whitespace-nowrap',
				render: (event) => describeSubject(event),
			},
			{
				key: 'metadata',
				header: <Trans>Details</Trans>,
				cellClassName:
					'px-6 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap',
				render: (event) => describeMetadata(event),
			},
			{
				key: 'fullname',
				header: <Trans>Account</Trans>,
				cellClassName:
					'px-6 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap',
				render: (event) => (
					<UserIdentity fullname={event.fullname} avatarUrl={event.avatarUrl} />
				),
			},
			{
				key: 'actorFullname',
				header: <Trans>Done by</Trans>,
				cellClassName:
					'px-6 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap',
				render: (event) => (
					<UserIdentity
						fullname={event.actorFullname}
						avatarUrl={event.actorAvatarUrl}
					/>
				),
			},
			{
				key: 'ip',
				header: <Trans>Address</Trans>,
				cellClassName:
					'px-6 py-3 text-sm font-mono text-gray-600 dark:text-gray-400',
				render: (event) => event.ip ?? <NaContent />,
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
