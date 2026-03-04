import { Trans } from '@lingui/react/macro';
import { IconButton } from '@minimalstuff/ui';
import { DataTable } from '~/components/common/data_table/data_table';
import { NaContent } from '~/components/common/na_content';
import { useSessions } from '~/hooks/use_sessions';
import { formatDate } from '~/lib/format';
import { useModalStore } from '~/stores/modal_store';

export function Sessions() {
	const { sessions, revokeSession } = useSessions();
	const openConfirmModal = useModalStore((state) => state.openConfirm);

	const handleRevokeSession = (sessionId: string) => {
		const session = sessions.find((s) => s.sessionId === sessionId);
		if (!session) return;

		openConfirmModal({
			title: <Trans>Sign out session</Trans>,
			children: (
				<p className="text-sm text-gray-600 dark:text-gray-300">
					<Trans>Are you sure you want to sign out this session?</Trans>
				</p>
			),
			confirmLabel: <Trans>Sign out</Trans>,
			cancelLabel: <Trans>Cancel</Trans>,
			confirmColor: 'red',
			onConfirm: () => revokeSession(sessionId),
		});
	};

	return (
		<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
					<Trans>Active sessions</Trans>
				</h2>
			</div>

			{sessions.length === 0 && (
				<p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
					<Trans>No active sessions</Trans>
				</p>
			)}

			{sessions.length > 0 && (
				<DataTable
					data={sessions}
					getRowKey={(session) => session.sessionId}
					containerStyle={{ maxHeight: 300 }}
					minWidthClassName="min-w-[700px]"
					tableClassName="w-full"
					theadClassName="bg-white dark:bg-gray-800"
					tbodyClassName="bg-white dark:bg-gray-800"
					bordered={false}
					headerCellClassName="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
					columns={[
						{
							key: 'id',
							header: <Trans>ID</Trans>,
							cellClassName:
								'px-4 py-3 text-sm text-gray-900 dark:text-gray-100',
							render: (session) => session.sessionId,
						},
						{
							key: 'ip',
							header: <Trans>IP</Trans>,
							cellClassName:
								'px-4 py-3 text-sm text-gray-900 dark:text-gray-100',
							render: (session) => session.ip ?? <NaContent />,
						},
						{
							key: 'device',
							header: <Trans>Device</Trans>,
							cellClassName:
								'px-4 py-3 text-sm text-gray-900 dark:text-gray-100',
							render: (session) => session.browser?.name ?? <NaContent />,
						},
						{
							key: 'expiresAt',
							header: <Trans>Expires at</Trans>,
							cellClassName:
								'px-4 py-3 text-sm text-gray-900 dark:text-gray-100',
							render: (session) =>
								session.expiresAt ? (
									formatDate(session.expiresAt)
								) : (
									<NaContent />
								),
						},
						{
							key: 'actions',
							header: <Trans>Actions</Trans>,
							cellClassName:
								'px-4 py-3 text-sm text-gray-900 dark:text-gray-100',
							render: (session) => (
								<IconButton
									icon="i-tabler-logout-2"
									onClick={() => handleRevokeSession(session.sessionId)}
									aria-label="Sign out session"
									variant="danger"
									size="sm"
								/>
							),
						},
					]}
				/>
			)}
		</div>
	);
}
