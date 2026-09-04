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
 * `@adonisjs/auth`'s own wildcard ability — what a token created before this
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
