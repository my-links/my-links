import { DateTime } from 'luxon';
import { inject } from '@adonisjs/core';
import type { Session } from '@adonisjs/session';
import { urlFor } from '@adonisjs/core/services/url_builder';

import type { RequestOrigin } from '#lib/request_origin';
import { AuthEventService } from '#services/auth/auth_event_service';
import { AUTH_EVENT_TYPE, SUDO_MODE_WINDOW_MINUTES } from '#constants/auth';
import SudoConfirmationFailedException from '#exceptions/auth/sudo_confirmation_failed_exception';

/**
 * Exported because the functional suite signs in through Japa's session
 * client, which writes session state directly instead of going through the
 * sign-in flow — a copy of the literal in the tests would be free to drift
 * away from this one.
 */
export const SUDO_CONFIRMED_AT_SESSION_KEY = 'sudo_confirmed_at';

const RETURN_URL_KEY = 'sudo_return_url';

export const SUDO_CONFIRMED_MESSAGE = 'Identity confirmed';

export type SudoConfirmationAttempt = {
	readonly userId: number;
	readonly origin: RequestOrigin;
};

/**
 * Sudo mode: a recent proof of identity, required before an operation that
 * could hand the account to somebody else.
 *
 * What it defends against is the session itself — a browser left open, a
 * stolen cookie, a shared machine. Being signed in is therefore deliberately
 * not enough; the proof has to have been given in the last few minutes.
 *
 * The session store is passed in rather than reached for through
 * `HttpContext`, so nothing here depends on being inside a request and the
 * whole policy stays testable as plain calls.
 */
@inject()
export class SudoModeService {
	constructor(protected readonly authEventService: AuthEventService) {}

	/**
	 * Stamps the proof without journaling it. Signing in calls this: a fresh
	 * login *is* a fresh proof, it already has its own audit entry, and asking
	 * for the password again one second later would only teach people to type
	 * it without reading the prompt.
	 */
	confirm(session: Session): void {
		session.put(SUDO_CONFIRMED_AT_SESSION_KEY, DateTime.now().toISO());
	}

	isConfirmed(session: Session): boolean {
		const confirmedAt = readIsoDateTime(session, SUDO_CONFIRMED_AT_SESSION_KEY);
		if (!confirmedAt) return false;

		return (
			confirmedAt.plus({ minutes: SUDO_MODE_WINDOW_MINUTES }) > DateTime.now()
		);
	}

	/**
	 * Accepts an explicit confirmation. Two flows reach it — a typed password
	 * and a Google round trip — and neither should have to restate what
	 * accepting one means.
	 */
	async grant(
		session: Session,
		{ userId, origin }: SudoConfirmationAttempt
	): Promise<void> {
		this.confirm(session);

		await this.authEventService.record({
			type: AUTH_EVENT_TYPE.SUDO_CONFIRMED,
			userId,
			...origin,
		});

		session.flash('success', SUDO_CONFIRMED_MESSAGE);
	}

	/**
	 * Journals the failure before throwing, because the exception renders
	 * itself and nobody downstream catches it — this is the last place that
	 * still knows an attempt was made. A run of these against one account is
	 * the clearest intrusion signal the journal can carry.
	 */
	async refuse({ userId, origin }: SudoConfirmationAttempt): Promise<never> {
		await this.authEventService.record({
			type: AUTH_EVENT_TYPE.SUDO_CONFIRMATION_FAILED,
			userId,
			...origin,
		});

		throw new SudoConfirmationFailedException();
	}

	/**
	 * Where to send the visitor once they have confirmed. Stored server-side
	 * rather than carried in the query string, so the confirmation cannot be
	 * turned into an open redirect.
	 */
	rememberReturnUrl(session: Session, url: string): void {
		session.put(RETURN_URL_KEY, url);
	}

	takeReturnUrl(session: Session): string {
		const returnUrl: unknown = session.get(RETURN_URL_KEY);
		session.forget(RETURN_URL_KEY);

		return typeof returnUrl === 'string' ? returnUrl : urlFor('user.settings');
	}
}

function readIsoDateTime(session: Session, key: string): DateTime | null {
	const storedValue: unknown = session.get(key);
	if (typeof storedValue !== 'string') return null;

	const parsed = DateTime.fromISO(storedValue);

	return parsed.isValid ? parsed : null;
}
