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
} as const;

export type AuthEventType =
	(typeof AUTH_EVENT_TYPE)[keyof typeof AUTH_EVENT_TYPE];
