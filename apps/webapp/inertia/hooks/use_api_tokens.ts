import { router, usePage } from '@inertiajs/react';

/**
 * Mirrors the backend's `API_TOKEN_SCOPE` (`#constants/api_token`) — kept as
 * a plain literal union here since frontend code can't reach into the
 * backend's `#`-aliased modules.
 */
export type ApiTokenScope = 'read_only' | 'full_access';

export type ApiToken = {
	identifier: number;
	token: string | undefined;
	name: string | null;
	type: 'bearer';
	createdAt: string | null;
	lastUsedAt: string | null;
	expiresAt: string | null;
	abilities: string[];
};

export function useApiTokens() {
	const {
		props: { tokens },
	} = usePage<{
		tokens: ApiToken[];
	}>();

	const createToken = async (
		name: string,
		scope: ApiTokenScope,
		expiresAt?: Date
	) => {
		return router.post('/user/api-tokens', { name, scope, expiresAt });
	};

	const revokeToken = async (tokenId: number) => {
		return router.delete(`/user/api-tokens/${tokenId}`);
	};

	return {
		tokens,
		createToken,
		revokeToken,
	};
}
