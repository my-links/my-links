import { t } from '@lingui/core/macro';
import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';
import { ConfirmModal, IconButton } from '@minimalstuff/ui';

import { usePasswordRecovery } from '~/hooks/use_password_recovery';
import {
	ACCOUNT_ROLE,
	useAccountActions,
} from '~/hooks/admin/use_account_actions';

interface AccountActionsProps {
	account: Data.User.Variants['withCounters'];
}

/**
 * What an administrator can do to one account, on the row that describes it.
 *
 * The two that take something away ask first; the two that only unblock do
 * not. Sending a reset link is offered only where mail is configured — without
 * it the endpoint answers 404 and the operator uses
 * `node ace user:reset-password --link`.
 */
export function AccountActions({ account }: Readonly<AccountActionsProps>) {
	const { isEnabled: isMailEnabled } = usePasswordRecovery();
	const { sendPasswordReset, markEmailConfirmed, revokeAccess, setRole } =
		useAccountActions();

	const handleSendPasswordReset = () => sendPasswordReset(account.id);

	const handleMarkEmailConfirmed = () => markEmailConfirmed(account.id);

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

	return (
		<div className="flex items-center justify-end gap-1">
			{isMailEnabled && (
				<IconButton
					icon="i-mdi-lock-reset"
					aria-label={t`Send a password reset link`}
					title={t`Send a password reset link`}
					size="sm"
					variant="ghost"
					onClick={handleSendPasswordReset}
				/>
			)}

			{!account.emailVerifiedAt && (
				<IconButton
					icon="i-mdi-email-check"
					aria-label={t`Mark the address as confirmed`}
					title={t`Mark the address as confirmed`}
					size="sm"
					variant="ghost"
					onClick={handleMarkEmailConfirmed}
				/>
			)}

			<IconButton
				icon="i-mdi-logout-variant"
				aria-label={t`Revoke every session and token`}
				title={t`Revoke every session and token`}
				size="sm"
				variant="ghost"
				onClick={handleRevokeAccess}
			/>

			<IconButton
				icon={account.isAdmin ? 'i-mdi-shield-off' : 'i-mdi-shield-account'}
				aria-label={
					account.isAdmin ? t`Demote to member` : t`Promote to administrator`
				}
				title={
					account.isAdmin ? t`Demote to member` : t`Promote to administrator`
				}
				size="sm"
				variant="ghost"
				onClick={handleToggleRole}
			/>
		</div>
	);
}
