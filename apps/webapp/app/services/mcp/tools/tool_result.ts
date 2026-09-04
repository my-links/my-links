import { HttpContext } from '@adonisjs/core/http';

import type { TokenAbility } from '#constants/api_token';
import { assertTokenAbility } from '#lib/api/tokens/abilities';

/**
 * A thrown error inside a tool handler never reaches AdonisJS's exception
 * handler — the MCP transport's HTTP response is already committed to the
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
		const message = error instanceof Error ? error.message : String(error);
		return { content: [{ type: 'text', text: message }], isError: true };
	}
}
