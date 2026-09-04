import { Exception } from '@adonisjs/core/exceptions';

import type { TokenAbility } from '#constants/api_token';

const STATUS = 403;
const CODE = 'E_INSUFFICIENT_TOKEN_ABILITY';

/**
 * Raised when the access token authenticating a `/api/v1/*` or `/api/mcp`
 * request lacks the ability the endpoint requires — a read-only token
 * reaching a write endpoint, for instance. No custom `handle()`: the
 * exception handler already renders API-prefixed routes as JSON, and MCP
 * tool calls catch this themselves to report it inside the JSON-RPC envelope
 * instead of letting it reach the framework at all.
 */
export default class InsufficientTokenAbilityException extends Exception {
	static status = STATUS;
	static code = CODE;

	constructor(ability: TokenAbility) {
		super(`This token does not have the "${ability}" ability`, {
			status: STATUS,
			code: CODE,
		});
	}
}
