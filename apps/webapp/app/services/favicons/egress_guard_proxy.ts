import logger from '@adonisjs/core/services/logger';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import http, {
	type IncomingMessage,
	type OutgoingHttpHeaders,
	type Server,
	type ServerResponse,
} from 'node:http';
import net, { type AddressInfo, type Socket, isIP } from 'node:net';
import type { Duplex } from 'node:stream';

import { EgressRefusedException } from '#exceptions/favicons/egress_refused_exception';
import {
	isBlockedAddress,
	type ResolvedAddress,
} from '#lib/network/blocked_address_list';
import {
	type HostnameResolver,
	resolveHostnameWithDns,
} from '#lib/network/hostname_resolver';

export type EgressProxyEndpoint = {
	url: string;
	authorizationHeader: string;
};

export type EgressGuardProxyOptions = {
	resolveHostname?: HostnameResolver;
	isAddressBlocked?: (address: ResolvedAddress) => boolean;
};

type TunnelTarget = { hostname: string; port: number };

const LOOPBACK_HOST = '127.0.0.1';
const PROXY_USERNAME = 'egress';
const SECRET_BYTES = 32;
const DEFAULT_HTTP_PORT = 80;
const BAD_GATEWAY_STATUS = 502;
const PROXY_AUTH_REQUIRED_STATUS = 407;
const UPSTREAM_IDLE_TIMEOUT_MS = 30_000;
const HOP_BY_HOP_HEADERS = ['proxy-authorization', 'proxy-connection'];

/**
 * Loopback HTTP proxy that resolves each target itself, refuses blocked addresses and connects to the vetted IP, so no later lookup can be rebound to an internal address.
 */
export class EgressGuardProxy {
	private readonly resolveHostname: HostnameResolver;
	private readonly isAddressBlocked: (address: ResolvedAddress) => boolean;
	private readonly secret = randomBytes(SECRET_BYTES).toString('hex');
	private readonly openSockets = new Set<Duplex>();
	private startup?: Promise<{ server: Server; endpoint: EgressProxyEndpoint }>;

	constructor({
		resolveHostname = resolveHostnameWithDns,
		isAddressBlocked = isBlockedAddress,
	}: EgressGuardProxyOptions = {}) {
		this.resolveHostname = resolveHostname;
		this.isAddressBlocked = isAddressBlocked;
	}

	async ensureStarted(): Promise<EgressProxyEndpoint> {
		this.startup ??= this.listen().catch((error) => {
			this.startup = undefined;
			throw error;
		});
		return (await this.startup).endpoint;
	}

	async stop(): Promise<void> {
		if (!this.startup) {
			return;
		}
		const { server } = await this.startup;
		this.startup = undefined;
		this.openSockets.forEach((socket) => socket.destroy());
		server.closeAllConnections();
		await new Promise<void>((resolve) => server.close(() => resolve()));
	}

	private listen(): Promise<{ server: Server; endpoint: EgressProxyEndpoint }> {
		const server = http.createServer((request, response) => {
			void this.handlePlainRequest(request, response);
		});
		server.on('connect', (request, clientSocket, head) => {
			void this.handleConnect(request, clientSocket, head);
		});
		server.unref();

		return new Promise((resolve, reject) => {
			server.once('error', reject);
			server.listen(0, LOOPBACK_HOST, () => {
				const { port } = server.address() as AddressInfo;
				const credentials = `${PROXY_USERNAME}:${this.secret}`;
				resolve({
					server,
					endpoint: {
						url: `http://${credentials}@${LOOPBACK_HOST}:${port}`,
						authorizationHeader: `Basic ${Buffer.from(credentials).toString('base64')}`,
					},
				});
			});
		});
	}

	private async handleConnect(
		request: IncomingMessage,
		clientSocket: Duplex,
		head: Buffer
	): Promise<void> {
		this.track(clientSocket);
		try {
			this.assertAuthorized(request);
			const target = this.parseTunnelTarget(request.url);
			const upstream = await this.connectToVetted(target);
			this.track(upstream);
			clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
			upstream.write(head);
			upstream.pipe(clientSocket);
			clientSocket.pipe(upstream);
		} catch (error) {
			this.refuseSocket(clientSocket, error);
		}
	}

	private async handlePlainRequest(
		request: IncomingMessage,
		response: ServerResponse
	): Promise<void> {
		try {
			this.assertAuthorized(request);
			const targetUrl = this.parsePlainTarget(request.url);
			const address = await this.vetHostname(targetUrl.hostname);
			this.forwardPlainRequest(request, response, targetUrl, address);
		} catch (error) {
			this.refuseResponse(response, error);
		}
	}

	private forwardPlainRequest(
		request: IncomingMessage,
		response: ServerResponse,
		targetUrl: URL,
		address: ResolvedAddress
	): void {
		const headers: OutgoingHttpHeaders = {
			...request.headers,
			host: targetUrl.host,
		};
		HOP_BY_HOP_HEADERS.forEach((name) => delete headers[name]);

		const upstreamRequest = http.request({
			host: address.address,
			port: Number(targetUrl.port) || DEFAULT_HTTP_PORT,
			method: request.method,
			path: `${targetUrl.pathname}${targetUrl.search}`,
			headers,
			timeout: UPSTREAM_IDLE_TIMEOUT_MS,
		});
		upstreamRequest.on('response', (upstreamResponse) => {
			response.writeHead(
				upstreamResponse.statusCode ?? BAD_GATEWAY_STATUS,
				upstreamResponse.headers
			);
			upstreamResponse.pipe(response);
		});
		upstreamRequest.on('timeout', () => upstreamRequest.destroy());
		upstreamRequest.on('error', () => this.refuseResponse(response));
		request.pipe(upstreamRequest);
	}

	private assertAuthorized(request: IncomingMessage): void {
		const received = Buffer.from(request.headers['proxy-authorization'] ?? '');
		const expected = Buffer.from(
			`Basic ${Buffer.from(`${PROXY_USERNAME}:${this.secret}`).toString('base64')}`
		);
		if (
			received.length !== expected.length ||
			!timingSafeEqual(received, expected)
		) {
			throw new EgressRefusedException('unauthorized');
		}
	}

	private parseTunnelTarget(requestTarget: string | undefined): TunnelTarget {
		const parsed = this.tryParseUrl(`http://${requestTarget}`);
		if (!parsed?.port) {
			throw new EgressRefusedException('malformed');
		}
		return { hostname: parsed.hostname, port: Number(parsed.port) };
	}

	private parsePlainTarget(requestTarget: string | undefined): URL {
		const parsed = this.tryParseUrl(requestTarget ?? '');
		if (parsed?.protocol !== 'http:') {
			throw new EgressRefusedException('malformed');
		}
		return parsed;
	}

	private tryParseUrl(value: string): URL | undefined {
		try {
			return new URL(value);
		} catch {
			return undefined;
		}
	}

	private async vetHostname(hostname: string): Promise<ResolvedAddress> {
		const bareHostname = hostname.replace(/^\[|\]$/g, '');
		const addresses = await this.resolveAddresses(bareHostname);
		if (addresses.length === 0) {
			throw new EgressRefusedException('unresolvable');
		}
		if (addresses.some((address) => this.isAddressBlocked(address))) {
			logger.debug('Egress guard refused a blocked address');
			throw new EgressRefusedException('blocked');
		}
		return addresses[0];
	}

	private async resolveAddresses(hostname: string): Promise<ResolvedAddress[]> {
		const literalFamily = isIP(hostname);
		if (literalFamily !== 0) {
			return [{ address: hostname, family: literalFamily }];
		}
		try {
			return await this.resolveHostname(hostname);
		} catch {
			return [];
		}
	}

	private async connectToVetted({
		hostname,
		port,
	}: TunnelTarget): Promise<Socket> {
		const { address } = await this.vetHostname(hostname);
		return new Promise((resolve, reject) => {
			const upstream = net.connect({ host: address, port });
			upstream.setTimeout(UPSTREAM_IDLE_TIMEOUT_MS, () => upstream.destroy());
			upstream.once('connect', () => resolve(upstream));
			upstream.once('error', (error) => {
				upstream.destroy();
				reject(error);
			});
		});
	}

	private track(socket: Duplex): void {
		this.openSockets.add(socket);
		socket.on('close', () => this.openSockets.delete(socket));
		socket.on('error', () => socket.destroy());
	}

	private refuseSocket(clientSocket: Duplex, error: unknown): void {
		const status = this.statusFor(error);
		clientSocket.end(
			`HTTP/1.1 ${status} Refused\r\nConnection: close\r\n${this.challengeHeader(status)}\r\n`
		);
	}

	private refuseResponse(response: ServerResponse, error?: unknown): void {
		if (response.headersSent) {
			response.destroy();
			return;
		}
		const status = this.statusFor(error);
		response.writeHead(status, {
			Connection: 'close',
			...(status === PROXY_AUTH_REQUIRED_STATUS && {
				'Proxy-Authenticate': 'Basic',
			}),
		});
		response.end();
	}

	private challengeHeader(status: number): string {
		return status === PROXY_AUTH_REQUIRED_STATUS
			? 'Proxy-Authenticate: Basic\r\n'
			: '';
	}

	private statusFor(error: unknown): number {
		if (error instanceof EgressRefusedException) {
			return error.status;
		}
		return BAD_GATEWAY_STATUS;
	}
}
