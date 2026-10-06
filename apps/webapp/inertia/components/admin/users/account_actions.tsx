import { t } from '@lingui/core/macro';
import type { Data } from '@generated/data';
import { IconButton, Tooltip } from '@minimalstuff/ui';

import { usePasswordRecovery } from '~/hooks/use_password_recovery';
import { useAccountActions } from '~/hooks/admin/use_account_actions';
import { useAccountConfirmations } from '~/hooks/admin/use_account_confirmations';

type AccountActionsProps = {
	account: Data.User.Variants['withCounters'];
};

/**
 * What an administrator can do to one account, on the row that describes it.
 *
 * The ones that take something away ask first; the ones that only unblock do
 * not. Sending a reset link is offered only where mail is configured; without
 * it the endpoint answers 404 and the operator uses
 * `node ace user:reset-password --link`.
 *
 * Delete and restore share one slot rather than sitting at opposite ends of
 * the row: they are the same lever in two states, and swapping in place keeps
 * every other button from shifting position when an account crosses the
 * grace-period boundary.
 */
export function AccountActions({ account }: Readonly<AccountActionsProps>) {
	const { isEnabled: isMailEnabled } = usePasswordRecovery();
	const { sendPasswordReset, markEmailConfirmed, restoreAccount } =
		useAccountActions();

	const handleSendPasswordReset = () => sendPasswordReset(account.id);

	const handleMarkEmailConfirmed = () => markEmailConfirmed(account.id);

	const handleRestoreAccount = () => restoreAccount(account.id);

	const { handleRequestDeletion, handleRevokeAccess, handleToggleRole } =
		useAccountConfirmations(account);

	return (
		<div className="flex items-center justify-end gap-1">
			{account.pendingDeletionAt ? (
				<Tooltip content={t`Cancel the pending deletion`}>
					<IconButton
						icon="i-mdi-restore"
						aria-label={t`Cancel the pending deletion`}
						color="success"
						size="sm"
						variant="ghost"
						onClick={handleRestoreAccount}
					/>
				</Tooltip>
			) : (
				!account.isAdmin && (
					<Tooltip content={t`Delete account`}>
						<IconButton
							icon="i-mdi-delete"
							aria-label={t`Delete account`}
							color="danger"
							size="sm"
							variant="ghost"
							onClick={handleRequestDeletion}
						/>
					</Tooltip>
				)
			)}

			{isMailEnabled && (
				<Tooltip content={t`Send a password reset link`}>
					<IconButton
						icon="i-mdi-lock-reset"
						aria-label={t`Send a password reset link`}
						size="sm"
						variant="ghost"
						onClick={handleSendPasswordReset}
					/>
				</Tooltip>
			)}

			{!account.emailVerifiedAt && (
				<Tooltip content={t`Mark the address as confirmed`}>
					<IconButton
						icon="i-mdi-email-check"
						aria-label={t`Mark the address as confirmed`}
						size="sm"
						variant="ghost"
						onClick={handleMarkEmailConfirmed}
					/>
				</Tooltip>
			)}

			<Tooltip content={t`Revoke every session and token`}>
				<IconButton
					icon="i-mdi-logout-variant"
					aria-label={t`Revoke every session and token`}
					size="sm"
					variant="ghost"
					onClick={handleRevokeAccess}
				/>
			</Tooltip>

			<Tooltip
				content={
					account.isAdmin ? t`Demote to member` : t`Promote to administrator`
				}
			>
				<IconButton
					icon={account.isAdmin ? 'i-mdi-shield-off' : 'i-mdi-shield-account'}
					aria-label={
						account.isAdmin ? t`Demote to member` : t`Promote to administrator`
					}
					size="sm"
					variant="ghost"
					onClick={handleToggleRole}
				/>
			</Tooltip>
		</div>
	);
}
