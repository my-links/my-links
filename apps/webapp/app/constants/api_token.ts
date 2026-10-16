/**
 * The abilities an access token can be checked against at the API/MCP
 * boundary. Kept coarse on purpose: per-resource abilities
 * (`links:read`, `collections:write`, ...) are a straightforward extension
 * once a real need for that granularity shows up.
 */
export const TOKEN_ABILITY = {
	READ: 'read',
	WRITE: 'write',
} as const;

export type TokenAbility = (typeof TOKEN_ABILITY)[keyof typeof TOKEN_ABILITY];

/**
 * `@adonisjs/auth`'s own wildcard ability: what a token created before this
 * feature shipped already carries, and what "full access" maps to today.
 */
const FULL_ACCESS_ABILITY = '*';

export const API_TOKEN_SCOPE = {
	READ_ONLY: 'read_only',
	FULL_ACCESS: 'full_access',
} as const;

export type ApiTokenScope =
	(typeof API_TOKEN_SCOPE)[keyof typeof API_TOKEN_SCOPE];

export const API_TOKEN_SCOPES = [
	API_TOKEN_SCOPE.READ_ONLY,
	API_TOKEN_SCOPE.FULL_ACCESS,
] as const satisfies readonly ApiTokenScope[];

/**
 * What each scope actually persists as `abilities` on the token row. Full
 * access stores the wildcard rather than `['read', 'write']` so it also
 * covers any ability introduced later without reissuing existing tokens.
 */
export const API_TOKEN_SCOPE_ABILITIES = {
	[API_TOKEN_SCOPE.READ_ONLY]: [TOKEN_ABILITY.READ],
	[API_TOKEN_SCOPE.FULL_ACCESS]: [FULL_ACCESS_ABILITY],
} as const satisfies Record<ApiTokenScope, readonly string[]>;

/**
 * Marker carried in the `abilities` of a token minted by the extension
 * handoff. `AccessToken` only hydrates a fixed set of columns, so a dedicated
 * column would cost an extra query per request, while the abilities travel
 * with the token the guard already loaded. It is never read from user input.
 */
export const EXTENSION_TOKEN_MARKER_ABILITY = 'extension';

export const API_TOKEN_EXPIRY = {
	THIRTY_DAYS: '30_days',
	NINETY_DAYS: '90_days',
	ONE_YEAR: '1_year',
	NEVER: 'never',
} as const;

export type ApiTokenExpiry =
	(typeof API_TOKEN_EXPIRY)[keyof typeof API_TOKEN_EXPIRY];

export const API_TOKEN_EXPIRIES = [
	API_TOKEN_EXPIRY.THIRTY_DAYS,
	API_TOKEN_EXPIRY.NINETY_DAYS,
	API_TOKEN_EXPIRY.ONE_YEAR,
	API_TOKEN_EXPIRY.NEVER,
] as const satisfies readonly ApiTokenExpiry[];

export const DEFAULT_API_TOKEN_EXPIRY = API_TOKEN_EXPIRY.NINETY_DAYS;

/** Lifetime in days per expiry choice, `null` meaning the token never expires. */
export const API_TOKEN_EXPIRY_DAYS = {
	[API_TOKEN_EXPIRY.THIRTY_DAYS]: 30,
	[API_TOKEN_EXPIRY.NINETY_DAYS]: 90,
	[API_TOKEN_EXPIRY.ONE_YEAR]: 365,
	[API_TOKEN_EXPIRY.NEVER]: null,
} as const satisfies Record<ApiTokenExpiry, number | null>;

export const EXTENSION_TOKEN_LIFETIME_DAYS = 90;

/** An extension token is renewed once this much of its lifetime has elapsed. */
export const EXTENSION_TOKEN_RENEWAL_THRESHOLD_DAYS = 1;
