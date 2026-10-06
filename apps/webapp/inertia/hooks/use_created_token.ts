import { usePage } from '@inertiajs/react';

import type { ApiToken } from '~/hooks/use_api_tokens';

export function useCreatedToken(): ApiToken | undefined {
	return usePage<{ token?: ApiToken }>().props.token;
}
