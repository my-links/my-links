import { test } from '@japa/runner';
import app from '@adonisjs/core/services/app';
import testUtils from '@adonisjs/core/services/test_utils';

import { VISIBILITY } from '#enums/collections/visibility';
import { createUser } from '#tests/factories/user_factory';
import { McpSessionManager } from '#services/mcp/mcp_session_manager';

const SESSION_HEADER = 'mcp-session-id';
const ACCEPT_BOTH = 'application/json, text/event-stream';
const SESSION_IDLE_TTL_MS = 30 * 60 * 1000;

type ToolCallResult = {
	content: Array<{ type: 'text'; text: string }>;
	isError?: boolean;
};
type JsonRpcResponse = {
	result?: { tools?: Array<{ name: string }> } & ToolCallResult;
	error?: { code: number; message: string };
};

function initializeRequest(id = 1) {
	return {
		jsonrpc: '2.0',
		id,
		method: 'initialize',
		params: {
			protocolVersion: '2025-06-18',
			capabilities: {},
			clientInfo: { name: 'test-client', version: '1.0.0' },
		},
	};
}

function toolCallRequest(
	id: number,
	name: string,
	args: Record<string, unknown>
) {
	return {
		jsonrpc: '2.0',
		id,
		method: 'tools/call',
		params: { name, arguments: args },
	};
}

function parseToolResult(response: { body(): unknown }) {
	const { result } = response.body() as JsonRpcResponse;
	const isError = result?.isError ?? false;
	const text = result?.content[0]?.text ?? 'null';
	// An error result's text is a human-readable message, not JSON — only a
	// successful result's text is the tool's JSON payload.
	return { isError, data: isError ? text : JSON.parse(text) };
}

test.group('API MCP — auth', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should reject a request without a bearer token', async ({ client }) => {
		const response = await client
			.post('/api/mcp')
			.header('Accept', ACCEPT_BOTH)
			.json(initializeRequest());

		response.assertStatus(401);
	});
});

test.group('API MCP — session handshake', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should hand out a session id and expose the registered tools', async ({
		client,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'mcp-handshake' });

		const initializeResponse = await client
			.post('/api/mcp')
			.header('Accept', ACCEPT_BOTH)
			.json(initializeRequest())
			.withGuard('api')
			.loginAs(user);

		initializeResponse.assertStatus(200);
		const sessionId = initializeResponse.headers()[SESSION_HEADER];
		assert.isString(sessionId);

		const toolsListResponse = await client
			.post('/api/mcp')
			.header('Accept', ACCEPT_BOTH)
			.header(SESSION_HEADER, sessionId)
			.json({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} })
			.withGuard('api')
			.loginAs(user);

		toolsListResponse.assertStatus(200);
		const toolNames = (
			toolsListResponse.body() as unknown as JsonRpcResponse
		).result?.tools?.map((tool) => tool.name);
		assert.includeMembers(toolNames ?? [], [
			'links.list',
			'links.create',
			'collections.list',
			'collections.follow',
			'inbox.get',
		]);
	});

	test('should reject a request carrying an unknown session id', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'mcp-unknown-session' });

		const response = await client
			.post('/api/mcp')
			.header('Accept', ACCEPT_BOTH)
			.header(SESSION_HEADER, 'does-not-exist')
			.json({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} })
			.withGuard('api')
			.loginAs(user);

		response.assertStatus(404);
	});
});

test.group('API MCP — session close', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('a DELETE closes the session, and its id can no longer be used', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'mcp-close' });

		const initializeResponse = await client
			.post('/api/mcp')
			.header('Accept', ACCEPT_BOTH)
			.json(initializeRequest())
			.withGuard('api')
			.loginAs(user);
		const sessionId = initializeResponse.headers()[SESSION_HEADER];

		const deleteResponse = await client
			.delete('/api/mcp')
			.header('Accept', ACCEPT_BOTH)
			.header(SESSION_HEADER, sessionId)
			.withGuard('api')
			.loginAs(user);
		deleteResponse.assertStatus(200);

		const afterCloseResponse = await client
			.post('/api/mcp')
			.header('Accept', ACCEPT_BOTH)
			.header(SESSION_HEADER, sessionId)
			.json({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} })
			.withGuard('api')
			.loginAs(user);

		afterCloseResponse.assertStatus(404);
	});
});

test.group('API MCP — idle session eviction', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('a session idle past the TTL is evicted and can no longer be used', async ({
		client,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'mcp-evict' });

		const initializeResponse = await client
			.post('/api/mcp')
			.header('Accept', ACCEPT_BOTH)
			.json(initializeRequest())
			.withGuard('api')
			.loginAs(user);
		const sessionId = initializeResponse.headers()[SESSION_HEADER];

		const stillAliveResponse = await client
			.post('/api/mcp')
			.header('Accept', ACCEPT_BOTH)
			.header(SESSION_HEADER, sessionId)
			.json({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} })
			.withGuard('api')
			.loginAs(user);
		stillAliveResponse.assertStatus(200);

		const sessionManager = await app.container.make(McpSessionManager);
		const evictedCount = await sessionManager.evictIdleSessions(
			Date.now() + SESSION_IDLE_TTL_MS + 1
		);
		assert.isAtLeast(evictedCount, 1);

		const afterEvictionResponse = await client
			.post('/api/mcp')
			.header('Accept', ACCEPT_BOTH)
			.header(SESSION_HEADER, sessionId)
			.json({ jsonrpc: '2.0', id: 3, method: 'tools/list', params: {} })
			.withGuard('api')
			.loginAs(user);

		afterEvictionResponse.assertStatus(404);
	});
});

test.group('API MCP — throttle isolation', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('spends its own rate-limit budget, separate from /api/v1', async ({
		client,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'mcp-throttle' });

		for (let attempt = 0; attempt < 5; attempt += 1) {
			await client.get('/api/v1/collections').withGuard('api').loginAs(user);
		}

		const initializeResponse = await client
			.post('/api/mcp')
			.header('Accept', ACCEPT_BOTH)
			.json(initializeRequest())
			.withGuard('api')
			.loginAs(user);

		initializeResponse.assertStatus(200);
		assert.equal(initializeResponse.headers()['x-ratelimit-remaining'], '299');
	});
});

test.group('API MCP — links tools/call', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should create a link through links.create and see it in links.list', async ({
		client,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'mcp-tools' });

		const initializeResponse = await client
			.post('/api/mcp')
			.header('Accept', ACCEPT_BOTH)
			.json(initializeRequest())
			.withGuard('api')
			.loginAs(user);
		const sessionId = initializeResponse.headers()[SESSION_HEADER];

		await client
			.post('/api/mcp')
			.header('Accept', ACCEPT_BOTH)
			.header(SESSION_HEADER, sessionId)
			.json({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} })
			.withGuard('api')
			.loginAs(user);

		const createResponse = await client
			.post('/api/mcp')
			.header('Accept', ACCEPT_BOTH)
			.header(SESSION_HEADER, sessionId)
			.json(
				toolCallRequest(2, 'links.create', {
					name: 'MCP created link',
					url: 'example.com',
					favorite: false,
				})
			)
			.withGuard('api')
			.loginAs(user);

		createResponse.assertStatus(200);
		const created = parseToolResult(createResponse);
		assert.isFalse(created.isError);
		assert.equal(created.data.link.name, 'MCP created link');
		assert.equal(created.data.link.url, 'https://example.com');

		const listResponse = await client
			.post('/api/mcp')
			.header('Accept', ACCEPT_BOTH)
			.header(SESSION_HEADER, sessionId)
			.json(toolCallRequest(3, 'links.list', {}))
			.withGuard('api')
			.loginAs(user);

		const listed = parseToolResult(listResponse);
		assert.isFalse(listed.isError);
		assert.include(
			(listed.data as Array<{ name: string }>).map((link) => link.name),
			'MCP created link'
		);
	});

	test('should report a domain error through isError instead of an HTTP failure', async ({
		client,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'mcp-tool-error' });

		const initializeResponse = await client
			.post('/api/mcp')
			.header('Accept', ACCEPT_BOTH)
			.json(initializeRequest())
			.withGuard('api')
			.loginAs(user);
		const sessionId = initializeResponse.headers()[SESSION_HEADER];

		const getMissingResponse = await client
			.post('/api/mcp')
			.header('Accept', ACCEPT_BOTH)
			.header(SESSION_HEADER, sessionId)
			.json(toolCallRequest(2, 'links.get', { id: 999999 }))
			.withGuard('api')
			.loginAs(user);

		getMissingResponse.assertStatus(200);
		const { result } = getMissingResponse.body() as unknown as JsonRpcResponse;
		assert.isTrue(result?.isError);
	});
});

test.group('API MCP — collections tools/call', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should create, get, list, update and delete a collection', async ({
		client,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'mcp-collections' });

		const initializeResponse = await client
			.post('/api/mcp')
			.header('Accept', ACCEPT_BOTH)
			.json(initializeRequest())
			.withGuard('api')
			.loginAs(user);
		const sessionId = initializeResponse.headers()[SESSION_HEADER];

		const call = (id: number, name: string, args: Record<string, unknown>) =>
			client
				.post('/api/mcp')
				.header('Accept', ACCEPT_BOTH)
				.header(SESSION_HEADER, sessionId)
				.json(toolCallRequest(id, name, args))
				.withGuard('api')
				.loginAs(user);

		const createResponse = await call(2, 'collections.create', {
			name: 'MCP collection',
			visibility: VISIBILITY.PRIVATE,
		});
		const created = parseToolResult(createResponse);
		assert.isFalse(created.isError);
		const collectionId = created.data.collection.id;
		assert.equal(created.data.collection.name, 'MCP collection');

		const getResponse = await call(3, 'collections.get', { id: collectionId });
		const got = parseToolResult(getResponse);
		assert.isFalse(got.isError);
		assert.equal(got.data.name, 'MCP collection');
		assert.deepEqual(got.data.links, []);

		const listResponse = await call(4, 'collections.list', {});
		const listed = parseToolResult(listResponse);
		assert.isFalse(listed.isError);
		assert.include(
			(listed.data.owned as Array<{ id: number }>).map((c) => c.id),
			collectionId
		);

		const updateResponse = await call(5, 'collections.update', {
			id: collectionId,
			name: 'MCP collection renamed',
			visibility: VISIBILITY.PRIVATE,
		});
		const updated = parseToolResult(updateResponse);
		assert.isFalse(updated.isError);
		assert.equal(updated.data.message, 'Collection updated successfully');

		const deleteResponse = await call(6, 'collections.delete', {
			id: collectionId,
		});
		const deleted = parseToolResult(deleteResponse);
		assert.isFalse(deleted.isError);

		const getAfterDeleteResponse = await call(7, 'collections.get', {
			id: collectionId,
		});
		const gotAfterDelete = parseToolResult(getAfterDeleteResponse);
		assert.isTrue(gotAfterDelete.isError);
	});

	test('should follow and unfollow a public collection', async ({
		client,
		assert,
	}) => {
		const owner = await createUser({ emailPrefix: 'mcp-follow-owner' });
		const follower = await createUser({ emailPrefix: 'mcp-follow-follower' });

		const ownerInit = await client
			.post('/api/mcp')
			.header('Accept', ACCEPT_BOTH)
			.json(initializeRequest())
			.withGuard('api')
			.loginAs(owner);
		const ownerSessionId = ownerInit.headers()[SESSION_HEADER];

		const createResponse = await client
			.post('/api/mcp')
			.header('Accept', ACCEPT_BOTH)
			.header(SESSION_HEADER, ownerSessionId)
			.json(
				toolCallRequest(2, 'collections.create', {
					name: 'Shared MCP collection',
					visibility: VISIBILITY.PUBLIC,
				})
			)
			.withGuard('api')
			.loginAs(owner);
		const created = parseToolResult(createResponse);
		const collectionId = created.data.collection.id;

		const followerInit = await client
			.post('/api/mcp')
			.header('Accept', ACCEPT_BOTH)
			.json(initializeRequest())
			.withGuard('api')
			.loginAs(follower);
		const followerSessionId = followerInit.headers()[SESSION_HEADER];

		const callAsFollower = (
			id: number,
			name: string,
			args: Record<string, unknown>
		) =>
			client
				.post('/api/mcp')
				.header('Accept', ACCEPT_BOTH)
				.header(SESSION_HEADER, followerSessionId)
				.json(toolCallRequest(id, name, args))
				.withGuard('api')
				.loginAs(follower);

		const followResponse = await callAsFollower(2, 'collections.follow', {
			collectionId,
		});
		assert.isFalse(parseToolResult(followResponse).isError);

		const listAfterFollow = parseToolResult(
			await callAsFollower(3, 'collections.list', {})
		);
		assert.include(
			(listAfterFollow.data.followed as Array<{ id: number }>).map((c) => c.id),
			collectionId
		);

		const unfollowResponse = await callAsFollower(4, 'collections.unfollow', {
			collectionId,
		});
		assert.isFalse(parseToolResult(unfollowResponse).isError);

		const listAfterUnfollow = parseToolResult(
			await callAsFollower(5, 'collections.list', {})
		);
		assert.notInclude(
			(listAfterUnfollow.data.followed as Array<{ id: number }>).map(
				(c) => c.id
			),
			collectionId
		);
	});

	test('should expose the Inbox through inbox.get', async ({
		client,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'mcp-inbox' });

		const initializeResponse = await client
			.post('/api/mcp')
			.header('Accept', ACCEPT_BOTH)
			.json(initializeRequest())
			.withGuard('api')
			.loginAs(user);
		const sessionId = initializeResponse.headers()[SESSION_HEADER];

		const inboxResponse = await client
			.post('/api/mcp')
			.header('Accept', ACCEPT_BOTH)
			.header(SESSION_HEADER, sessionId)
			.json(toolCallRequest(2, 'inbox.get', {}))
			.withGuard('api')
			.loginAs(user);

		const inbox = parseToolResult(inboxResponse);
		assert.isFalse(inbox.isError);
		assert.equal(inbox.data.name, 'Inbox');
		assert.isTrue(inbox.data.isDefault);
	});
});
