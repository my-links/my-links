interface AuthEventTypeBadgeProps {
	type: string;
}

const REFUSAL_MARKERS = ['failed', 'blocked', 'revoked', 'cancelled'];

const NEUTRAL_CLASS =
	'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300';
const REFUSAL_CLASS =
	'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';

/**
 * The event, spelled the way the database stores it.
 *
 * Deliberately untranslated and unmapped: the value is what a `grep` over the
 * table or a support conversation will name, and a friendly label per event
 * would be a second vocabulary to keep in step with `AUTH_EVENT_TYPE`. Only
 * the colour is interpreted — what went wrong is what an administrator scans
 * for.
 */
export const AuthEventTypeBadge = ({
	type,
}: Readonly<AuthEventTypeBadgeProps>) => (
	<span
		className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono ${
			REFUSAL_MARKERS.some((marker) => type.includes(marker))
				? REFUSAL_CLASS
				: NEUTRAL_CLASS
		}`}
	>
		{type}
	</span>
);
