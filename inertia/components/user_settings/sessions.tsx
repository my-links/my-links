import { Trans } from '@lingui/react/macro';
import { IconButton } from '@minimalstuff/ui';
import { NaContent } from '~/components/common/na_content';
import {
	SimpleTable,
	SimpleTableData,
} from '~/components/common/simple_table/simple_table';
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

	const rows: SimpleTableData[] =
		sessions?.map((session) => ({
			key: session?.sessionId,
			id: session?.sessionId,
			ip: session?.ip ?? <NaContent />,
			device: session?.browser?.name ?? <NaContent />,
			expiresAt: session?.expiresAt ? (
				formatDate(session.expiresAt)
			) : (
				<NaContent />
			),
			actions: [
				<IconButton
					key="revoke"
					icon="i-tabler-logout-2"
					onClick={() => handleRevokeSession(session.sessionId)}
					aria-label="Sign out session"
					variant="danger"
					size="sm"
				/>,
			],
		})) ?? [];

	return (
		<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
					<Trans>Active sessions</Trans>
				</h2>
			</div>

			{rows.length === 0 && (
				<p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
					<Trans>No active sessions</Trans>
				</p>
			)}

			{rows.length > 0 && <SimpleTable data={rows} />}
		</div>
	);
}
