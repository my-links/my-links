import { DateTime } from 'luxon';

import { SUDO_MODE_WINDOW_MINUTES } from '#constants/auth';
import { SUDO_CONFIRMED_AT_SESSION_KEY } from '#services/auth/sudo_mode_service';

/**
 * `loginAs()` writes the auth guard straight into the session, bypassing the
 * sign-in flow that would normally stamp a proof of identity. Every test
 * reaching a sudo-guarded route therefore has to say which of the two states
 * it is describing.
 */
export function freshSudoSession(): Record<string, string> {
	return { [SUDO_CONFIRMED_AT_SESSION_KEY]: DateTime.now().toISO() };
}

export function staleSudoSession(): Record<string, string> {
	const confirmedAt = DateTime.now().minus({
		minutes: SUDO_MODE_WINDOW_MINUTES + 1,
	});

	return { [SUDO_CONFIRMED_AT_SESSION_KEY]: confirmedAt.toISO() };
}
