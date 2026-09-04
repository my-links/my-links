import type { HttpContext } from '@adonisjs/core/http';

import type { TokenAbility } from '#constants/api_token';
import InsufficientTokenAbilityException from '#exceptions/api/insufficient_token_ability_exception';

/**
 * Throws unless the access token authenticating the current request allows
 * `ability`. Only meaningful behind the `api` guard — call after
 * `auth.authenticate()`/`auth.authenticateUsing(['api'])` has run, not
 * before.
 */
export function assertTokenAbility(
	ctx: HttpContext,
	ability: TokenAbility
): void {
	const currentAccessToken = ctx.auth.use('api').user?.currentAccessToken;

	if (!currentAccessToken?.allows(ability)) {
		throw new InsufficientTokenAbilityException(ability);
	}
}
