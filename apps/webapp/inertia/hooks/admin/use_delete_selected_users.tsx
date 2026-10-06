import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { ConfirmModal } from '@minimalstuff/ui';

import { urlFor } from '~/lib/tuyau';

type UseDeleteSelectedUsersReturn = {
	isDeleting: boolean;
	deleteSelected: () => void;
};

export function useDeleteSelectedUsers(
	selectedUserIds: Set<number>,
	clearSelection: () => void
): UseDeleteSelectedUsersReturn {
	const [isDeleting, setIsDeleting] = useState(false);

	const deleteSelected = () => {
		if (selectedUserIds.size === 0) return;

		const targetIds = Array.from(selectedUserIds);
		void ConfirmModal.call({
			title: <Trans>Delete accounts</Trans>,
			children: (
				<Trans>
					You are about to disable {targetIds.length} account(s). Every session
					and token is revoked immediately. Collections and links are
					permanently deleted once the grace period ends, unless you restore the
					account before then.
				</Trans>
			),
			confirmLabel: <Trans>Delete</Trans>,
			cancelLabel: <Trans>Cancel</Trans>,
			confirmColor: 'danger',
			onConfirm: async () => {
				setIsDeleting(true);
				const bulkDeleteUrl = urlFor('admin.users.bulk-delete');
				router.post(
					bulkDeleteUrl,
					{ userIds: targetIds },
					{
						preserveScroll: true,
						onSuccess: () => {
							clearSelection();
						},
						onFinish: () => {
							setIsDeleting(false);
						},
					}
				);
			},
		});
	};

	return { isDeleting, deleteSelected };
}
