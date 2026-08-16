import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';

import { cn } from '~/lib/cn';
import { formatDate } from '~/lib/format';

interface PendingDeletionBadgeProps {
	pendingDeletionAt: string | null;
}

const PENDING_DELETION_CLASS =
	'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';

/**
 * Most accounts never have this set, so unlike `EmailVerificationBadge` (an
 * always-visible two-state flag) this one renders nothing at all until a
 * deletion request is actually pending.
 */
export const PendingDeletionBadge = ({
	pendingDeletionAt,
}: Readonly<PendingDeletionBadgeProps>) => {
	if (!pendingDeletionAt) return null;

	return (
		<span
			title={t`Deletion requested on ${formatDate(pendingDeletionAt)}`}
			className={cn(
				'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
				PENDING_DELETION_CLASS
			)}
		>
			<i className="i-mdi-clock-alert w-3.5 h-3.5" />
			<Trans>Pending deletion</Trans>
		</span>
	);
};
