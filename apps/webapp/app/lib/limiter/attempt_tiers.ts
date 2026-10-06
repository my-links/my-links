export type AttemptTier = {
	readonly name: string;
	readonly requests: number;
	readonly window: string;
	readonly blockFor: string;
};

/**
 * The tier a human mistyping their password runs into first. Exported so a
 * spec asserts against the configured budget instead of a copy of it.
 */
export const LOGIN_BURST_TIER = {
	name: 'burst',
	requests: 5,
	window: '1 minute',
	blockFor: '1 minute',
} as const satisfies AttemptTier;

/**
 * Stacked windows, each blocking longer than the last. Fixed-window limiters
 * cannot grow a penalty on their own, so the escalation is expressed by
 * layering them: keep failing past the burst budget and the sustained tier
 * takes over, then the persistent one. Blocking is deliberately the only
 * consequence — locking the account itself would hand any stranger a way to
 * shut a chosen user out of their own instance.
 */
export const LOGIN_ATTEMPT_TIERS = [
	LOGIN_BURST_TIER,
	{
		name: 'sustained',
		requests: 20,
		window: '15 minutes',
		blockFor: '15 minutes',
	},
	{ name: 'persistent', requests: 50, window: '1 hour', blockFor: '1 hour' },
] as const satisfies readonly AttemptTier[];

/**
 * Registration is the other unauthenticated write, and the one an address
 * harvester would walk to find out which emails already have an account. The
 * budget is smaller than the sign-in one because nobody legitimately creates
 * three accounts in ten minutes.
 */
export const REGISTRATION_BURST_TIER = {
	name: 'burst',
	requests: 3,
	window: '10 minutes',
	blockFor: '10 minutes',
} as const satisfies AttemptTier;

export const REGISTRATION_ATTEMPT_TIERS = [
	REGISTRATION_BURST_TIER,
	{ name: 'sustained', requests: 10, window: '1 hour', blockFor: '1 hour' },
] as const satisfies readonly AttemptTier[];

/**
 * Guessing a 256-bit token is not a threat anyone can carry out, so the budget
 * is here to keep the endpoint from being a free way to spend an instance's
 * database and CPU — hence a ceiling well above what following a link from a
 * mailbox costs, prefetching mail clients included.
 */
export const TOKEN_VERIFICATION_BURST_TIER = {
	name: 'burst',
	requests: 20,
	window: '10 minutes',
	blockFor: '10 minutes',
} as const satisfies AttemptTier;

export const TOKEN_VERIFICATION_TIERS = [
	TOKEN_VERIFICATION_BURST_TIER,
	{ name: 'sustained', requests: 60, window: '1 hour', blockFor: '1 hour' },
] as const satisfies readonly AttemptTier[];

/**
 * The budget of the flows where a visitor types an address and the instance
 * mails a link to it — asking for a password reset, asking for a fresh
 * confirmation link. Sending is free for whoever asks and costs the instance a
 * mail, so the budget is about stopping someone from walking a list of
 * addresses to spray; the ceiling is well above what a person who mistypes
 * their own address twice ever needs.
 *
 * The tiers are shared, the budgets are not: each flow defines its own
 * throttle, so spending one does not spend the other.
 */
export const MAILED_LINK_REQUEST_BURST_TIER = {
	name: 'burst',
	requests: 5,
	window: '15 minutes',
	blockFor: '15 minutes',
} as const satisfies AttemptTier;

export const MAILED_LINK_REQUEST_TIERS = [
	MAILED_LINK_REQUEST_BURST_TIER,
	{ name: 'sustained', requests: 15, window: '1 hour', blockFor: '1 hour' },
] as const satisfies readonly AttemptTier[];

/**
 * Confirming sudo mode is a password prompt behind a session, so it is a
 * guessing surface like sign-in — and a tighter one, since the account is
 * already picked and only its owner should ever be typing here.
 */
export const SUDO_CONFIRMATION_BURST_TIER = {
	name: 'burst',
	requests: 5,
	window: '5 minutes',
	blockFor: '5 minutes',
} as const satisfies AttemptTier;

export const SUDO_CONFIRMATION_TIERS = [
	SUDO_CONFIRMATION_BURST_TIER,
	{ name: 'sustained', requests: 20, window: '1 hour', blockFor: '1 hour' },
] as const satisfies readonly AttemptTier[];

/**
 * Asking to move an account to another address costs two mails and sits behind
 * a session, so the budget only has to stop a signed-in account from spraying
 * confirmation links at addresses it does not own.
 */
export const EMAIL_CHANGE_REQUEST_BURST_TIER = {
	name: 'burst',
	requests: 5,
	window: '15 minutes',
	blockFor: '15 minutes',
} as const satisfies AttemptTier;

export const EMAIL_CHANGE_REQUEST_TIERS = [
	EMAIL_CHANGE_REQUEST_BURST_TIER,
	{ name: 'sustained', requests: 15, window: '1 hour', blockFor: '1 hour' },
] as const satisfies readonly AttemptTier[];

export const VERIFICATION_RESEND_BURST_TIER = MAILED_LINK_REQUEST_BURST_TIER;
