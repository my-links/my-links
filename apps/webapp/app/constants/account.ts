/**
 * What an account is allowed to do on the instance. The database records this
 * as the `is_admin` boolean; the vocabulary exists so the console and, later,
 * the admin dashboard name the two states instead of passing a bare `true`
 * around.
 */
export const ACCOUNT_ROLE = {
	ADMINISTRATOR: 'administrator',
	MEMBER: 'member',
} as const;

export type AccountRole = (typeof ACCOUNT_ROLE)[keyof typeof ACCOUNT_ROLE];

export const ACCOUNT_ROLES = [
	ACCOUNT_ROLE.ADMINISTRATOR,
	ACCOUNT_ROLE.MEMBER,
] as const satisfies readonly AccountRole[];

/**
 * How long a self-service deletion request sits disabled before the account
 * is actually wiped. Long enough that logging back in is a realistic way to
 * catch an accidental delete, short enough that the account doesn't linger
 * indefinitely.
 */
export const ACCOUNT_DELETION_GRACE_PERIOD_DAYS = 30;

/**
 * How long an account can go unseen before the inactivity sweep starts its
 * grace period too. Counted from `lastSeenAt`, or from `createdAt` for an
 * account that was never signed into at all.
 */
export const ACCOUNT_INACTIVITY_THRESHOLD_DAYS = 365;

/**
 * Why a deletion was requested — the only thing this changes is the wording
 * of the confirmation mail, since an inactive account never asked for
 * anything and telling it "your request" would be wrong. `requestAccountDeletion`
 * defaults to the self-service reason; the inactivity sweep is the only other
 * caller.
 */
export const ACCOUNT_DELETION_REASON = {
	SELF_REQUESTED: 'self_requested',
	INACTIVITY: 'inactivity',
} as const;

export type AccountDeletionReason =
	(typeof ACCOUNT_DELETION_REASON)[keyof typeof ACCOUNT_DELETION_REASON];
