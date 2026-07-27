/**
 * Authentication vocabulary shared by the models, the migrations and the
 * services. Kept as `as const` objects rather than TypeScript enums so the
 * values persisted in database are plain strings.
 */

export const AUTH_PROVIDER = {
	GOOGLE: 'google',
} as const;

export type AuthProvider = (typeof AUTH_PROVIDER)[keyof typeof AUTH_PROVIDER];

export const ONE_TIME_TOKEN_TYPE = {
	EMAIL_VERIFICATION: 'email_verification',
	PASSWORD_RESET: 'password_reset',
	EMAIL_CHANGE: 'email_change',
} as const;

export type OneTimeTokenType =
	(typeof ONE_TIME_TOKEN_TYPE)[keyof typeof ONE_TIME_TOKEN_TYPE];

/**
 * How long a link stays usable, per purpose. A reset link is the one an
 * attacker with mailbox access would replay, so it is the shortest; confirming
 * an address is not urgent and has to survive a mail queue plus a night's
 * sleep.
 *
 * The lifetime is looked up here rather than passed by callers, so no flow can
 * accidentally mint a token that outlives its policy.
 */
export const ONE_TIME_TOKEN_LIFETIME_HOURS = {
	[ONE_TIME_TOKEN_TYPE.EMAIL_VERIFICATION]: 24,
	[ONE_TIME_TOKEN_TYPE.PASSWORD_RESET]: 1,
	[ONE_TIME_TOKEN_TYPE.EMAIL_CHANGE]: 24,
} as const satisfies Record<OneTimeTokenType, number>;

/**
 * Whether an instance accepts new accounts. Left unset, the answer is derived
 * from the instance itself — see `resolveRegistrationPolicy`.
 */
export const REGISTRATION_POLICY = {
	OPEN: 'open',
	CLOSED: 'closed',
} as const;

export type RegistrationPolicy =
	(typeof REGISTRATION_POLICY)[keyof typeof REGISTRATION_POLICY];

export const REGISTRATION_POLICIES = [
	REGISTRATION_POLICY.OPEN,
	REGISTRATION_POLICY.CLOSED,
] as const satisfies readonly RegistrationPolicy[];

/**
 * How long proving your identity keeps sensitive account operations open.
 *
 * Short enough that a session left open on a shared machine is not a way to
 * take the account over, long enough that a person working through their
 * settings is asked once rather than at every click.
 */
export const SUDO_MODE_WINDOW_MINUTES = 15;

export const AUTH_EVENT_TYPE = {
	LOGIN_SUCCEEDED: 'login_succeeded',
	LOGIN_FAILED: 'login_failed',
	LOGOUT: 'logout',
	REGISTERED: 'registered',
	EMAIL_VERIFIED: 'email_verified',
	EMAIL_CHANGE_REQUESTED: 'email_change_requested',
	EMAIL_CHANGED: 'email_changed',
	PASSWORD_SET: 'password_set',
	PASSWORD_CHANGED: 'password_changed',
	PASSWORD_RESET_REQUESTED: 'password_reset_requested',
	PASSWORD_RESET_COMPLETED: 'password_reset_completed',
	PROVIDER_LINKED: 'provider_linked',
	PROVIDER_UNLINKED: 'provider_unlinked',
	SUDO_CONFIRMED: 'sudo_confirmed',
	SUDO_CONFIRMATION_FAILED: 'sudo_confirmation_failed',
} as const;

export type AuthEventType =
	(typeof AUTH_EVENT_TYPE)[keyof typeof AUTH_EVENT_TYPE];
