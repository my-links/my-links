import { router, usePage } from '@inertiajs/react';

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

	const createToken = async (name: string, expiresAt?: Date) => {
		return router.post('/user/api-tokens', { name, expiresAt });
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
