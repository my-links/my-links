import { DateTime } from 'luxon';

import type User from '#models/user';
import UserSession from '#models/user_session';

const SESSION_LIFETIME_DAYS = 7;

/**
 * A row in the session store, the way the database session driver writes one.
 *
 * The suite itself runs on the memory store — Japa's session client simulates
 * sessions there — so a spec about revoking sessions has to seed the table it
 * is asserting against.
 */
export async function createUserSession(user: User): Promise<UserSession> {
	return UserSession.create({
		userId: String(user.id),
		data: JSON.stringify({ message: {} }),
		expiresAt: DateTime.now().plus({ days: SESSION_LIFETIME_DAYS }),
	});
}
