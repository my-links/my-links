import { router, usePage } from '@inertiajs/react';

interface ApiToken {
	id: number;
	name: string;
	token: string;
	lastUsedAt: string | null;
	expiresAt: string | null;
	isActive: boolean;
	createdAt: string;
}

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
