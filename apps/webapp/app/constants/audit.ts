/**
 * The audit vocabulary shared by the model, the migrations and the services.
 * `audit_events` carries two kinds of row — authentication and activity —
 * distinguished by `subjectType` (null means authentication). This module
 * only joins their type vocabularies together; each kind still owns its own
 * constants (`#constants/auth`, `#constants/activity`).
 *
 * Kept as `as const` objects rather than TypeScript enums so the values
 * persisted in database are plain strings.
 */

import type { AuthEventType } from '#constants/auth';
import type { ActivityEventType } from '#constants/activity';

export type AuditEventType = AuthEventType | ActivityEventType;

export const AUDIT_SUBJECT_TYPE = {
	LINK: 'link',
	COLLECTION: 'collection',
	ACCOUNT: 'account',
} as const;

export type AuditSubjectType =
	(typeof AUDIT_SUBJECT_TYPE)[keyof typeof AUDIT_SUBJECT_TYPE];
