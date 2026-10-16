import { test } from '@japa/runner';
import http, { type Server } from 'node:http';
import net, { type AddressInfo } from 'node:net';

import {
	EgressGuardProxy,
	type EgressProxyEndpoint,
} from '#services/favicons/egress_guard_proxy';

const UPSTREAM_BODY = 'upstream-ok';
const PUBLIC_ADDRESS = { address: '93.184.216.34', family: 4 };
const PRIVATE_ADDRESS = { address: '169.254.169.254', family: 4 };
const LOOPBACK_ADDRESS = { address: '127.0.0.1', family: 4 };
const WRONG_AUTHORIZATION = 'Basic d3Jvbmc6Y3JlZGVudGlhbHM=';

type ProxyReply = { status: number; body: string };

function startUpstreamServer(): Promise<{ server: Server; port: number }> {
	const server = http.createServer((_request, response) => {
		response.end(UPSTREAM_BODY);
	});
	return new Promise((resolve) => {
		server.listen(0, '127.0.0.1', () => {
			resolve({ server, port: (server.address() as AddressInfo).port });
		});
	});
}

function proxyPort(endpoint: EgressProxyEndpoint): number {
	return Number(new URL(endpoint.url).port);
}

function readHttpStatus(rawResponse: string): number {
	return Number(rawResponse.split(' ')[1]);
}

function sendPlainRequest(
	endpoint: EgressProxyEndpoint,
	targetUrl: string,
	authorization: string | undefined
): Promise<ProxyReply> {
	return new Promise((resolve, reject) => {
		const request = http.request(
			{
				host: '127.0.0.1',
				port: proxyPort(endpoint),
				path: targetUrl,
				headers: authorization
					? { 'Proxy-Authorization': authorization }
					: undefined,
			},
			(response) => {
				let body = '';
				response.on('data', (chunk) => (body += chunk));
				response.on('end', () =>
					resolve({ status: response.statusCode ?? 0, body })
				);
			}
		);
		request.on('error', reject);
		request.end();
	});
}

function sendConnect(
	endpoint: EgressProxyEndpoint,
	target: string,
	authorization: string | undefined
): Promise<ProxyReply> {
	return new Promise((resolve, reject) => {
		const socket = net.connect(proxyPort(endpoint), '127.0.0.1');
		const authorizationLine = authorization
			? `Proxy-Authorization: ${authorization}\r\n`
			: '';
		let received = '';

		socket.on('connect', () =>
			socket.write(
				`CONNECT ${target} HTTP/1.1\r\nHost: ${target}\r\n${authorizationLine}\r\n`
			)
		);
		socket.on('data', (chunk) => {
			received += chunk.toString();
			const isTunnelOpen =
				received.includes('\r\n\r\n') && received.startsWith('HTTP/1.1 200');
			if (isTunnelOpen && !received.includes(UPSTREAM_BODY)) {
				socket.write(
					'GET / HTTP/1.1\r\nHost: public.test\r\nConnection: close\r\n\r\n'
				);
			}
		});
		socket.on('error', reject);
		socket.on('close', () =>
			resolve({ status: readHttpStatus(received), body: received })
		);
	});
}

test.group('EgressGuardProxy authentication', (group) => {
	let guard: EgressGuardProxy;
	let endpoint: EgressProxyEndpoint;

	group.each.setup(async () => {
		guard = new EgressGuardProxy({
			resolveHostname: async () => [PUBLIC_ADDRESS],
			isAddressBlocked: () => false,
		});
		endpoint = await guard.ensureStarted();
	});

	group.each.teardown(() => guard.stop());

	test('should refuse a plain request without the proxy secret', async ({
		assert,
	}) => {
		const reply = await sendPlainRequest(
			endpoint,
			'http://public.test/',
			undefined
		);

		assert.equal(reply.status, 407);
	});

	test('should refuse a plain request with a wrong proxy secret', async ({
		assert,
	}) => {
		const reply = await sendPlainRequest(
			endpoint,
			'http://public.test/',
			WRONG_AUTHORIZATION
		);

		assert.equal(reply.status, 407);
	});

	test('should refuse a CONNECT request without the proxy secret', async ({
		assert,
	}) => {
		const reply = await sendConnect(endpoint, 'public.test:443', undefined);

		assert.equal(reply.status, 407);
	});
});

test.group('EgressGuardProxy address vetting', (group) => {
	let guard: EgressGuardProxy | undefined;

	group.each.teardown(async () => {
		await guard?.stop();
		guard = undefined;
	});

	function guardResolvingTo(
		addresses: { address: string; family: number }[]
	): EgressGuardProxy {
		guard = new EgressGuardProxy({ resolveHostname: async () => addresses });
		return guard;
	}

	async function guardAfterPreCheckLookup(): Promise<EgressGuardProxy> {
		let lookupCount = 0;
		const resolveHostname = async () => [
			lookupCount++ === 0 ? PUBLIC_ADDRESS : PRIVATE_ADDRESS,
		];
		const preCheckAnswer = await resolveHostname();
		if (preCheckAnswer[0] !== PUBLIC_ADDRESS) {
			throw new Error('The pre-check lookup must see the public address');
		}
		guard = new EgressGuardProxy({ resolveHostname });
		return guard;
	}

	test('should refuse a plain request to a host resolving to a private address', async ({
		assert,
	}) => {
		const endpoint = await guardResolvingTo([PRIVATE_ADDRESS]).ensureStarted();

		const reply = await sendPlainRequest(
			endpoint,
			'http://internal.test/',
			endpoint.authorizationHeader
		);

		assert.equal(reply.status, 403);
	});

	test('should refuse a CONNECT to a host resolving to a private address', async ({
		assert,
	}) => {
		const endpoint = await guardResolvingTo([PRIVATE_ADDRESS]).ensureStarted();

		const reply = await sendConnect(
			endpoint,
			'internal.test:443',
			endpoint.authorizationHeader
		);

		assert.equal(reply.status, 403);
	});

	test('should refuse a CONNECT to a blocked IP literal', async ({
		assert,
	}) => {
		const endpoint = await guardResolvingTo([PUBLIC_ADDRESS]).ensureStarted();

		const reply = await sendConnect(
			endpoint,
			'127.0.0.1:8080',
			endpoint.authorizationHeader
		);

		assert.equal(reply.status, 403);
	});

	test('should refuse a plain request when the host rebinds to a private address after the first lookup', async ({
		assert,
	}) => {
		const endpoint = await (await guardAfterPreCheckLookup()).ensureStarted();

		const reply = await sendPlainRequest(
			endpoint,
			'http://rebind.test/',
			endpoint.authorizationHeader
		);

		assert.equal(reply.status, 403);
	});

	test('should refuse a CONNECT when the host rebinds to a private address after the first lookup', async ({
		assert,
	}) => {
		const endpoint = await (await guardAfterPreCheckLookup()).ensureStarted();

		const reply = await sendConnect(
			endpoint,
			'rebind.test:443',
			endpoint.authorizationHeader
		);

		assert.equal(reply.status, 403);
	});

	test('should answer 502 when the host cannot be resolved', async ({
		assert,
	}) => {
		const endpoint = await guardResolvingTo([]).ensureStarted();

		const reply = await sendPlainRequest(
			endpoint,
			'http://missing.test/',
			endpoint.authorizationHeader
		);

		assert.equal(reply.status, 502);
	});
});

test.group('EgressGuardProxy pass-through', (group) => {
	let guard: EgressGuardProxy;
	let endpoint: EgressProxyEndpoint;
	let upstream: Server;
	let upstreamPort: number;

	group.each.setup(async () => {
		({ server: upstream, port: upstreamPort } = await startUpstreamServer());
		guard = new EgressGuardProxy({
			resolveHostname: async () => [LOOPBACK_ADDRESS],
			isAddressBlocked: () => false,
		});
		endpoint = await guard.ensureStarted();
	});

	group.each.teardown(async () => {
		await guard.stop();
		await new Promise((resolve) => upstream.close(resolve));
	});

	test('should forward a plain request to the vetted address', async ({
		assert,
	}) => {
		const reply = await sendPlainRequest(
			endpoint,
			`http://public.test:${upstreamPort}/`,
			endpoint.authorizationHeader
		);

		assert.deepEqual(reply, { status: 200, body: UPSTREAM_BODY });
	});

	test('should tunnel a CONNECT request to the vetted address', async ({
		assert,
	}) => {
		const reply = await sendConnect(
			endpoint,
			`public.test:${upstreamPort}`,
			endpoint.authorizationHeader
		);

		assert.include(reply.body, UPSTREAM_BODY);
	});
});
