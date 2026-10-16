import { test } from '@japa/runner';
import app from '@adonisjs/core/services/app';
import type { ApiClient } from '@japa/api-client';
import testUtils from '@adonisjs/core/services/test_utils';

import type User from '#models/user';
import { MAXIMUM_DATABASE_ID } from '#constants/database';
import { VISIBILITY } from '#enums/collections/visibility';
import { createUser } from '#tests/factories/user_factory';
import { LinkService } from '#services/links/link_service';
import { MAXIMUM_SEARCH_TERM_LENGTH } from '#constants/search';
import { LinkQueryService } from '#services/links/link_query_service';
import { CollectionService } from '#services/collections/collection_service';
import { CollectionLinkService } from '#services/collections/collection_link_service';
import { CollectionQueryService } from '#services/collections/collection_query_service';
import { CollectionFollowerService } from '#services/collections/collection_follower_service';
import {
	McpSessionManager,
	type McpSessionLimits,
} from '#services/mcp/mcp_session_manager';

const SESSION_HEADER = 'mcp-session-id';
const ACCEPT_BOTH = 'application/json, text/event-stream';
const SESSION_IDLE_TTL_MS = 30 * 60 * 1000;
const INTERNAL_ERROR_MESSAGE = 'Internal error';

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
	// An error result's text is a human-readable message, not JSON: only a
	// successful result's text is the tool's JSON payload.
	return { isError, data: isError ? text : JSON.parse(text) };
}

test.group('API MCP: auth', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should reject a request without a bearer token', async ({ client }) => {
		const response = await client
			.post('/api/mcp')
			.header('Accept', ACCEPT_BOTH)
			.json(initializeRequest());

		response.assertStatus(401);
	});
});

test.group('API MCP: session handshake', (group) => {
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

test.group('API MCP: session close', (group) => {
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

test.group('API MCP: idle session eviction', (group) => {
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

test.group('API MCP: throttle isolation', (group) => {
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

test.group('API MCP: links tools/call', (group) => {
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

test.group('API MCP: collections tools/call', (group) => {
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

test.group('API MCP: token abilities', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('a read-only token can call a read tool but not a write tool', async ({
		client,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'mcp-ability-read' });

		const initializeResponse = await client
			.post('/api/mcp')
			.header('Accept', ACCEPT_BOTH)
			.json(initializeRequest())
			.withGuard('api')
			.loginAs(user, ['read']);
		const sessionId = initializeResponse.headers()[SESSION_HEADER];

		const listResponse = await client
			.post('/api/mcp')
			.header('Accept', ACCEPT_BOTH)
			.header(SESSION_HEADER, sessionId)
			.json(toolCallRequest(2, 'links.list', {}))
			.withGuard('api')
			.loginAs(user, ['read']);

		const listed = parseToolResult(listResponse);
		assert.isFalse(listed.isError);

		const createResponse = await client
			.post('/api/mcp')
			.header('Accept', ACCEPT_BOTH)
			.header(SESSION_HEADER, sessionId)
			.json(
				toolCallRequest(3, 'links.create', {
					name: 'Should be refused',
					url: 'example.com',
					favorite: false,
				})
			)
			.withGuard('api')
			.loginAs(user, ['read']);

		const created = parseToolResult(createResponse);
		assert.isTrue(created.isError);
	});

	test('a full-access token can call both read and write tools', async ({
		client,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'mcp-ability-full' });

		const initializeResponse = await client
			.post('/api/mcp')
			.header('Accept', ACCEPT_BOTH)
			.json(initializeRequest())
			.withGuard('api')
			.loginAs(user, ['*']);
		const sessionId = initializeResponse.headers()[SESSION_HEADER];

		const createResponse = await client
			.post('/api/mcp')
			.header('Accept', ACCEPT_BOTH)
			.header(SESSION_HEADER, sessionId)
			.json(
				toolCallRequest(2, 'links.create', {
					name: 'Allowed link',
					url: 'example.com',
					favorite: false,
				})
			)
			.withGuard('api')
			.loginAs(user, ['*']);

		const created = parseToolResult(createResponse);
		assert.isFalse(created.isError);
	});
});

test.group('API MCP: link url validation', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	const REJECTED_URLS = ['javascript://%0aalert(1)', 'file:///etc/passwd'];
	let nextRequestId = 2;

	async function openSession(client: ApiClient, user: User) {
		const initializeResponse = await client
			.post('/api/mcp')
			.header('Accept', ACCEPT_BOTH)
			.json(initializeRequest())
			.withGuard('api')
			.loginAs(user);

		return String(initializeResponse.headers()[SESSION_HEADER]);
	}

	async function callTool(
		client: ApiClient,
		user: User,
		sessionId: string,
		name: string,
		args: Record<string, unknown>
	) {
		nextRequestId += 1;
		const response = await client
			.post('/api/mcp')
			.header('Accept', ACCEPT_BOTH)
			.header(SESSION_HEADER, sessionId)
			.json(toolCallRequest(nextRequestId, name, args))
			.withGuard('api')
			.loginAs(user);

		return parseToolResult(response);
	}

	function linkArguments(url: string) {
		return { name: 'MCP url check', url, favorite: false };
	}

	for (const rejectedUrl of REJECTED_URLS) {
		test(`should reject ${rejectedUrl} through links.create`, async ({
			client,
			assert,
		}) => {
			const user = await createUser({ emailPrefix: 'mcp-url-create' });
			const sessionId = await openSession(client, user);

			const created = await callTool(
				client,
				user,
				sessionId,
				'links.create',
				linkArguments(rejectedUrl)
			);

			assert.isTrue(created.isError);
			assert.include(String(created.data), 'Invalid url');
		});

		test(`should reject ${rejectedUrl} through links.update`, async ({
			client,
			assert,
		}) => {
			const user = await createUser({ emailPrefix: 'mcp-url-update' });
			const sessionId = await openSession(client, user);
			const created = await callTool(
				client,
				user,
				sessionId,
				'links.create',
				linkArguments('example.com')
			);

			const updated = await callTool(client, user, sessionId, 'links.update', {
				id: created.data.link.id,
				...linkArguments(rejectedUrl),
			});

			assert.isTrue(updated.isError);
			assert.include(String(updated.data), 'Invalid url');
		});
	}

	test('should normalize a bare domain to https through links.create', async ({
		client,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'mcp-url-bare' });
		const sessionId = await openSession(client, user);

		const created = await callTool(
			client,
			user,
			sessionId,
			'links.create',
			linkArguments('example.com')
		);

		assert.equal(created.data.link.url, 'https://example.com');
	});

	test('should keep an http url through links.create', async ({
		client,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'mcp-url-http' });
		const sessionId = await openSession(client, user);

		const created = await callTool(
			client,
			user,
			sessionId,
			'links.create',
			linkArguments('http://example.com/page')
		);

		assert.equal(created.data.link.url, 'http://example.com/page');
	});

	test('should normalize a bare domain to https through links.update', async ({
		client,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'mcp-url-update-bare' });
		const sessionId = await openSession(client, user);
		const created = await callTool(
			client,
			user,
			sessionId,
			'links.create',
			linkArguments('example.com')
		);

		await callTool(client, user, sessionId, 'links.update', {
			id: created.data.link.id,
			...linkArguments('example.org'),
		});

		const fetched = await callTool(client, user, sessionId, 'links.get', {
			id: created.data.link.id,
		});
		assert.equal(fetched.data.url, 'https://example.org');
	});
});

async function openSession(client: ApiClient, user: User) {
	const response = await client
		.post('/api/mcp')
		.header('Accept', ACCEPT_BOTH)
		.json(initializeRequest())
		.withGuard('api')
		.loginAs(user);

	return { response, sessionId: response.headers()[SESSION_HEADER] };
}

async function listTools(client: ApiClient, user: User, sessionId: string) {
	return client
		.post('/api/mcp')
		.header('Accept', ACCEPT_BOTH)
		.header(SESSION_HEADER, sessionId)
		.json({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} })
		.withGuard('api')
		.loginAs(user);
}

test.group('API MCP: session ownership', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should answer a stranger using someone else session like an unknown session', async ({
		client,
		assert,
	}) => {
		const owner = await createUser({ emailPrefix: 'mcp-session-owner' });
		const stranger = await createUser({ emailPrefix: 'mcp-session-stranger' });
		const { sessionId } = await openSession(client, owner);

		const strangerResponse = await listTools(client, stranger, sessionId);
		const unknownResponse = await listTools(client, stranger, 'does-not-exist');

		strangerResponse.assertStatus(404);
		assert.deepEqual(strangerResponse.body(), unknownResponse.body());
	});

	test('should not let a stranger close someone else session', async ({
		client,
	}) => {
		const owner = await createUser({ emailPrefix: 'mcp-delete-owner' });
		const stranger = await createUser({ emailPrefix: 'mcp-delete-stranger' });
		const { sessionId } = await openSession(client, owner);

		const deleteResponse = await client
			.delete('/api/mcp')
			.header('Accept', ACCEPT_BOTH)
			.header(SESSION_HEADER, sessionId)
			.withGuard('api')
			.loginAs(stranger);

		deleteResponse.assertStatus(404);
		const ownerResponse = await listTools(client, owner, sessionId);
		ownerResponse.assertStatus(200);
	});
});

const TEST_LIMITS: McpSessionLimits = {
	maximumSessions: 3,
	maximumSessionsPerUser: 2,
};

async function buildSessionManager(limits: McpSessionLimits) {
	return new McpSessionManager(
		await app.container.make(LinkService),
		await app.container.make(LinkQueryService),
		await app.container.make(CollectionService),
		await app.container.make(CollectionQueryService),
		await app.container.make(CollectionLinkService),
		await app.container.make(CollectionFollowerService),
		limits
	);
}

test.group('API MCP: session caps', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.setup(async () => {
		const limitedManager = await buildSessionManager(TEST_LIMITS);
		app.container.swap(McpSessionManager, () => limitedManager);
	});
	group.each.teardown(() => app.container.restore(McpSessionManager));

	test('should close the oldest session of a user who goes over the per-user cap', async ({
		client,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'mcp-per-user-cap' });
		const { sessionId: oldestSessionId } = await openSession(client, user);
		await openSession(client, user);

		const { response, sessionId: newestSessionId } = await openSession(
			client,
			user
		);

		response.assertStatus(200);
		const sessionManager = await app.container.make(McpSessionManager);
		assert.equal(
			sessionManager.sessionCount,
			TEST_LIMITS.maximumSessionsPerUser
		);
		const oldestResponse = await listTools(client, user, oldestSessionId);
		oldestResponse.assertStatus(404);
		const newestResponse = await listTools(client, user, newestSessionId);
		newestResponse.assertStatus(200);
	});

	test('should keep one user sessions from using up another user cap', async ({
		client,
	}) => {
		const busyUser = await createUser({ emailPrefix: 'mcp-busy-user' });
		const otherUser = await createUser({ emailPrefix: 'mcp-other-user' });
		const { sessionId: otherSessionId } = await openSession(client, otherUser);

		await openSession(client, busyUser);
		await openSession(client, busyUser);
		await openSession(client, busyUser);

		const otherResponse = await listTools(client, otherUser, otherSessionId);
		otherResponse.assertStatus(200);
	});

	test('should refuse a new session once the instance is full', async ({
		client,
		assert,
	}) => {
		const firstUser = await createUser({ emailPrefix: 'mcp-full-first' });
		const secondUser = await createUser({ emailPrefix: 'mcp-full-second' });
		await openSession(client, firstUser);
		await openSession(client, firstUser);
		await openSession(client, secondUser);

		const latecomer = await createUser({ emailPrefix: 'mcp-full-latecomer' });
		const { response } = await openSession(client, latecomer);

		response.assertStatus(503);
		const sessionManager = await app.container.make(McpSessionManager);
		assert.equal(sessionManager.sessionCount, TEST_LIMITS.maximumSessions);
	});
});

async function callTool(
	client: ApiClient,
	user: User,
	sessionId: string,
	name: string,
	args: Record<string, unknown>
) {
	const response = await client
		.post('/api/mcp')
		.header('Accept', ACCEPT_BOTH)
		.header(SESSION_HEADER, sessionId)
		.json(toolCallRequest(2, name, args))
		.withGuard('api')
		.loginAs(user);

	return parseToolResult(response);
}

test.group('API MCP: tool errors', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should keep the message of a known typed exception', async ({
		client,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'mcp-known-error' });
		const { sessionId } = await openSession(client, user);

		const result = await callTool(client, user, sessionId, 'links.create', {
			name: 'Orphan link',
			url: 'https://example.com',
			favorite: false,
			collectionIds: [MAXIMUM_DATABASE_ID],
		});

		assert.isTrue(result.isError);
		assert.equal(
			result.data,
			'One or more collections do not belong to the authenticated user'
		);
	});

	test('should answer a generic message when an unexpected error is thrown', async ({
		client,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'mcp-unexpected-error' });
		const { sessionId } = await openSession(client, user);

		const result = await callTool(client, user, sessionId, 'links.create', {
			name: 'Unstorable \u0000 link',
			url: 'https://example.com',
			favorite: false,
		});

		assert.isTrue(result.isError);
		assert.equal(result.data, INTERNAL_ERROR_MESSAGE);
	});
});

test.group('API MCP: links.search', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should treat a percent sign as a literal character', async ({
		client,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'mcp-search-percent' });
		const { sessionId } = await openSession(client, user);
		await callTool(client, user, sessionId, 'links.create', {
			name: 'Fifty percent off',
			url: 'https://example.com/50%25',
			favorite: false,
		});
		await callTool(client, user, sessionId, 'links.create', {
			name: 'Plain link',
			url: 'https://example.com/plain',
			favorite: false,
		});

		const result = await callTool(client, user, sessionId, 'links.search', {
			term: '%',
		});

		assert.deepEqual(
			result.data.map((link: { name: string }) => link.name),
			['Fifty percent off']
		);
	});

	test('should refuse a search term longer than the maximum', async ({
		client,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'mcp-search-long' });
		const { sessionId } = await openSession(client, user);

		const response = await client
			.post('/api/mcp')
			.header('Accept', ACCEPT_BOTH)
			.header(SESSION_HEADER, sessionId)
			.json(
				toolCallRequest(2, 'links.search', {
					term: 'a'.repeat(MAXIMUM_SEARCH_TERM_LENGTH + 1),
				})
			)
			.withGuard('api')
			.loginAs(user);

		const { result, error } = response.body() as unknown as JsonRpcResponse;
		assert.isTrue(result?.isError === true || error !== undefined);
	});
});
