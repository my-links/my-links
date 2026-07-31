import { Trans } from '@lingui/react/macro';

interface EmailVerificationBadgeProps {
	emailVerifiedAt: string | null;
}

const CONFIRMED_CLASS =
	'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
const UNCONFIRMED_CLASS =
	'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';

/**
 * Whether anybody ever proved they read the mailbox this account is named
 * after. On an instance with outgoing mail it is also whether the account can
 * sign in at all.
 */
export const EmailVerificationBadge = ({
	emailVerifiedAt,
}: Readonly<EmailVerificationBadgeProps>) => (
	<span
		className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
			emailVerifiedAt ? CONFIRMED_CLASS : UNCONFIRMED_CLASS
		}`}
	>
		<i
			className={`w-3.5 h-3.5 ${emailVerifiedAt ? 'i-mdi-check-circle' : 'i-mdi-alert-circle'}`}
		/>
		{emailVerifiedAt ? <Trans>Confirmed</Trans> : <Trans>Unconfirmed</Trans>}
	</span>
);
