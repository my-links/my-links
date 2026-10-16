import { HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import { Exception } from '@adonisjs/core/exceptions';

import type { TokenAbility } from '#constants/api_token';
import { assertTokenAbility } from '#lib/api/tokens/abilities';

const FIRST_SERVER_ERROR_STATUS = 500;
const INTERNAL_ERROR_MESSAGE = 'Internal error';

/**
 * Typed exceptions with a client-error status (not found, forbidden, invalid
 * input...) are written for the person on the other end, so their message
 * goes through. Anything else (a database error, a bug, a server-status
 * exception) can carry table names or query text, so it is logged here and
 * the caller only learns that it failed.
 */
function describeToolFailure(error: unknown): string {
	if (error instanceof Exception && error.status < FIRST_SERVER_ERROR_STATUS) {
		return error.message;
	}

	logger.error({ err: error }, 'MCP tool failed unexpectedly');
	return INTERNAL_ERROR_MESSAGE;
}

/**
 * A thrown error inside a tool handler never reaches AdonisJS's exception
 * handler: the MCP transport's HTTP response is already committed to the
 * JSON-RPC envelope by the time a handler runs. Tools report failure inside
 * that envelope instead, via `isError`, which is why every handler runs
 * through this instead of letting exceptions propagate.
 *
 * `ability` is also checked here rather than in a shared MCP-wide
 * middleware: every tool call arrives as the same `POST /api/mcp`, so only
 * the tool itself knows whether it reads or writes.
 */
export async function runTool(
	ability: TokenAbility,
	action: () => Promise<unknown>
): Promise<{ content: Array<{ type: 'text'; text: string }>; isError?: true }> {
	try {
		assertTokenAbility(HttpContext.getOrFail(), ability);
		const result = await action();
		return {
			content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
		};
	} catch (error) {
		return {
			content: [{ type: 'text', text: describeToolFailure(error) }],
			isError: true,
		};
	}
}
