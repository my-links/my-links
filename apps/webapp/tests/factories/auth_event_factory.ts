import type User from '#models/user';
import AuditEvent from '#models/audit_event';
import type { AuthEventType } from '#constants/auth';

const DEFAULT_IP = '203.0.113.7';
const DEFAULT_USER_AGENT = 'Test Agent';

type AuthEventAttributes = {
	readonly user: User;
	readonly type: AuthEventType;
	readonly actor?: User;
};

/**
 * A line of the authentication journal, written the way a controller writes
 * one. Specs about the dashboard and the journal both need seeded history, and
 * neither cares how the row is shaped.
 */
export async function recordAuthEvent({
	user,
	type,
	actor,
}: AuthEventAttributes): Promise<AuditEvent> {
	return AuditEvent.create({
		userId: user.id,
		actorId: actor?.id ?? null,
		type,
		ip: DEFAULT_IP,
		userAgent: DEFAULT_USER_AGENT,
	});
}
