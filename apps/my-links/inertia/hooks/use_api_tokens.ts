import { router, usePage } from '@inertiajs/react';
import { ApiToken } from '~/types/app';

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
