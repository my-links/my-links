/**
 * A thrown error inside a tool handler never reaches AdonisJS's exception
 * handler — the MCP transport's HTTP response is already committed to the
 * JSON-RPC envelope by the time a handler runs. Tools report failure inside
 * that envelope instead, via `isError`, which is why every handler runs
 * through this instead of letting exceptions propagate.
 */
export async function runTool(
	action: () => Promise<unknown>
): Promise<{ content: Array<{ type: 'text'; text: string }>; isError?: true }> {
	try {
		const result = await action();
		return {
			content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		return { content: [{ type: 'text', text: message }], isError: true };
	}
}
