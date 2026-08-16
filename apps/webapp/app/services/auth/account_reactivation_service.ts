import type { Session } from '@adonisjs/session';

import type User from '#models/user';

/**
 * Exported for the same reason `SUDO_CONFIRMED_AT_SESSION_KEY` is: a spec that
 * needs to arm this state directly, without walking the whole login flow,
 * should not have to keep a copy of the literal in sync by hand.
 */
export const PENDING_REACTIVATION_SESSION_KEY = 'pending_reactivation_account';

type PendingReactivationAccount = {
	readonly userId: number;
	readonly email: string;
};

/**
 * Carries a disabled account's identity across the round trip from "password
 * just verified" to "owner explicitly chose to reactivate or not" — the
 * password check already proved who is asking, so this is the same trust
 * level `SudoModeService` relies on for its own session state.
 *
 * The session is passed in rather than reached for through `HttpContext`, for
 * the same reason `SudoModeService` does it: nothing here depends on being
 * inside a request, and the whole policy stays testable as plain calls.
 */
export class AccountReactivationService {
	armPendingConfirmation(session: Session, user: User): void {
		session.put(PENDING_REACTIVATION_SESSION_KEY, {
			userId: user.id,
			email: user.email,
		} satisfies PendingReactivationAccount);
	}

	/**
	 * Read-only, for rendering the confirmation page — the visitor just typed
	 * this address themselves, so showing it back is a reassurance, not an
	 * enumeration risk.
	 */
	peekPendingAccount(session: Session): PendingReactivationAccount | null {
		return readPendingAccount(session, PENDING_REACTIVATION_SESSION_KEY);
	}

	/**
	 * Read and clear. Both the confirm and the decline action call this: either
	 * choice settles the pending state, and neither should leave it behind for
	 * a later request to stumble into.
	 */
	takePendingAccount(session: Session): PendingReactivationAccount | null {
		const account = this.peekPendingAccount(session);
		session.forget(PENDING_REACTIVATION_SESSION_KEY);

		return account;
	}
}

function readPendingAccount(
	session: Session,
	key: string
): PendingReactivationAccount | null {
	const storedValue: unknown = session.get(key);
	if (
		typeof storedValue !== 'object' ||
		storedValue === null ||
		typeof (storedValue as { userId?: unknown }).userId !== 'number' ||
		typeof (storedValue as { email?: unknown }).email !== 'string'
	) {
		return null;
	}

	return storedValue as PendingReactivationAccount;
}
