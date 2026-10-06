import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';
import { ConfirmModal } from '@minimalstuff/ui';

import {
	ACCOUNT_ROLE,
	useAccountActions,
} from '~/hooks/admin/use_account_actions';

type UseAccountConfirmationsReturn = {
	handleRequestDeletion: () => void;
	handleRevokeAccess: () => void;
	handleToggleRole: () => void;
};

export function useAccountConfirmations(
	account: Data.User.Variants['withCounters']
): UseAccountConfirmationsReturn {
	const { revokeAccess, setRole, requestDeletion } = useAccountActions();

	const handleRequestDeletion = () => {
		void ConfirmModal.call({
			title: <Trans>Delete account</Trans>,
			children: (
				<p className="text-sm text-gray-600 dark:text-gray-300">
					<Trans>
						This disables the account and revokes every session and token
						immediately. It is permanently deleted once the grace period ends,
						unless you restore it before then.
					</Trans>
				</p>
			),
			confirmLabel: <Trans>Delete</Trans>,
			cancelLabel: <Trans>Cancel</Trans>,
			confirmColor: 'danger',
			onConfirm: () => requestDeletion(account.id),
		});
	};

	const handleRevokeAccess = () => {
		void ConfirmModal.call({
			title: <Trans>Revoke access</Trans>,
			children: (
				<p className="text-sm text-gray-600 dark:text-gray-300">
					<Trans>
						Every browser session and every extension token of this account will
						stop working immediately.
					</Trans>
				</p>
			),
			confirmLabel: <Trans>Revoke</Trans>,
			cancelLabel: <Trans>Cancel</Trans>,
			confirmColor: 'danger',
			onConfirm: () => revokeAccess(account.id),
		});
	};

	const handleToggleRole = () => {
		void ConfirmModal.call({
			title: account.isAdmin ? (
				<Trans>Demote to member</Trans>
			) : (
				<Trans>Promote to administrator</Trans>
			),
			children: (
				<p className="text-sm text-gray-600 dark:text-gray-300">
					{account.isAdmin ? (
						<Trans>
							This account will lose access to the admin area, including this
							page.
						</Trans>
					) : (
						<Trans>
							This account will be able to manage every account on this
							instance.
						</Trans>
					)}
				</p>
			),
			confirmLabel: <Trans>Confirm</Trans>,
			cancelLabel: <Trans>Cancel</Trans>,
			confirmColor: account.isAdmin ? 'danger' : 'primary',
			onConfirm: () =>
				setRole(
					account.id,
					account.isAdmin ? ACCOUNT_ROLE.MEMBER : ACCOUNT_ROLE.ADMINISTRATOR
				),
		});
	};

	return { handleRequestDeletion, handleRevokeAccess, handleToggleRole };
}
