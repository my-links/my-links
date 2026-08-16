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
