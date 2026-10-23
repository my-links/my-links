import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';
import { createHmac, randomUUID } from 'node:crypto';

import { deriveAccountThrottleKey } from '#lib/limiter/account_throttle_key';
import type { PenaltyBudget } from '#lib/limiter/failed_attempt_penalty';
import User from '#models/user';
import env from '#start/env';

const KNOWN_DEVICES_COOKIE = 'known_devices';
const KNOWN_DEVICE_LIFETIME = '180 days';
const MAX_REMEMBERED_ACCOUNTS = 5;

type KnownDevice = {
	readonly account: string;
	readonly device: string;
	readonly passwordFingerprint: string;
};

function keyedDigest(value: string): string {
	return createHmac('sha256', env.get('APP_KEY')).update(value).digest('hex');
}

function fingerprintPassword(passwordHash: string): string {
	return keyedDigest(`known-device-password:${passwordHash}`);
}

function isKnownDevice(candidate: unknown): candidate is KnownDevice {
	if (typeof candidate !== 'object' || candidate === null) return false;

	return (
		'account' in candidate &&
		typeof candidate.account === 'string' &&
		'device' in candidate &&
		typeof candidate.device === 'string' &&
		'passwordFingerprint' in candidate &&
		typeof candidate.passwordFingerprint === 'string'
	);
}

/**
 * Lets a browser that already signed in to an account keep signing in to it
 * while strangers burn the shared failure budget for that email.
 *
 * The cookie is encrypted, so it cannot be forged, and each entry is bound to
 * the HMAC of one email and to a fingerprint of the password hash at the time:
 * changing or resetting the password retires every cookie issued before it.
 * Matching an entry costs no lookup, and a lookup only follows a match, which
 * only a browser that really signed in to that email can produce, so the
 * check is not an enumeration oracle.
 */
@inject()
export class KnownDeviceService {
	async resolveBudget(
		ctx: HttpContext,
		normalizedEmail: string
	): Promise<PenaltyBudget> {
		const account = deriveAccountThrottleKey(
			normalizedEmail,
			env.get('APP_KEY')
		);
		const knownDevice = this.readDevices(ctx).find(
			(device) => device.account === account
		);
		if (!knownDevice) return { dimension: 'account', key: account };

		const isStillValid = await this.hasCurrentPassword(
			normalizedEmail,
			knownDevice
		);
		if (!isStillValid) return { dimension: 'account', key: account };

		return {
			dimension: 'device',
			key: keyedDigest(`${account}:${knownDevice.device}`),
		};
	}

	/**
	 * Takes the user loaded by the credential check, whose password row is
	 * already preloaded.
	 */
	remember(ctx: HttpContext, user: User): void {
		const passwordHash = user.passwordAuth?.password;
		if (!passwordHash) return;

		const account = deriveAccountThrottleKey(
			user.email.trim().toLowerCase(),
			env.get('APP_KEY')
		);
		const devices = this.readDevices(ctx);
		const existing = devices.find((device) => device.account === account);
		const entry: KnownDevice = {
			account,
			device: existing?.device ?? randomUUID(),
			passwordFingerprint: fingerprintPassword(passwordHash),
		};
		const otherDevices = devices.filter((device) => device.account !== account);

		ctx.response.encryptedCookie(
			KNOWN_DEVICES_COOKIE,
			[...otherDevices, entry].slice(-MAX_REMEMBERED_ACCOUNTS),
			{
				maxAge: KNOWN_DEVICE_LIFETIME,
				httpOnly: true,
				secure: env.get('NODE_ENV') === 'production',
				sameSite: 'lax',
			}
		);
	}

	private readDevices(ctx: HttpContext): KnownDevice[] {
		const stored: unknown = ctx.request.encryptedCookie(KNOWN_DEVICES_COOKIE);
		if (!Array.isArray(stored)) return [];

		return stored.filter(isKnownDevice);
	}

	private async hasCurrentPassword(
		normalizedEmail: string,
		knownDevice: KnownDevice
	): Promise<boolean> {
		const user = await User.query()
			.where('email', normalizedEmail)
			.preload('passwordAuth')
			.first();
		const passwordHash = user?.passwordAuth?.password;
		if (!passwordHash) return false;

		return (
			fingerprintPassword(passwordHash) === knownDevice.passwordFingerprint
		);
	}
}
