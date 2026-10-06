import type { DateTime } from 'luxon';
import type { TransactionClientContract } from '@adonisjs/lucid/types/database';

import AuditEvent from '#models/audit_event';
import type { RequestOrigin } from '#lib/request_origin';
import type { AuditSubjectType } from '#constants/audit';
import type { ActivityEventType } from '#constants/activity';
import { paginateAuditJournal } from '#lib/audit_journal_query';

/**
 * Something a user or an administrator did to a collection, a link, or an
 * account's data. Never the content of any of those — see the constraint
 * documented on `#constants/activity`.
 */
export type ActivityEventRecord = {
	readonly type: ActivityEventType;
	readonly userId: number;
	readonly origin: RequestOrigin;
	readonly actorId?: number | null;
	readonly subjectType: AuditSubjectType;
	readonly subjectId: number;
	readonly metadata?: Record<string, unknown> | null;
};

/**
 * How long an activity row is kept before `pruneBefore` removes it.
 * Authentication rows are exempt — see `pruneBefore`.
 */
export const ACTIVITY_EVENT_RETENTION_DAYS = 90;

export class ActivityEventService {
	/**
	 * The optional transaction client is what lets a row live or die with the
	 * mutation it describes, exactly like `SyncJournalService.recordDeletedLink`.
	 * No try/catch: a failed insert propagates and rolls back the mutation with
	 * it, the same as `AuthEventService` behaves today.
	 */
	async record(
		record: ActivityEventRecord,
		client?: TransactionClientContract
	): Promise<void> {
		await AuditEvent.create(
			{
				type: record.type,
				userId: record.userId,
				actorId: record.actorId ?? null,
				subjectType: record.subjectType,
				subjectId: record.subjectId,
				metadata: record.metadata ?? null,
				ip: record.origin.ip,
				userAgent: record.origin.userAgent,
			},
			{ client }
		);
	}

	/**
	 * The journal, newest first, one page at a time. Mirrors
	 * `AuthEventService.listRecent`.
	 */
	listRecent(page: number) {
		return paginateAuditJournal(page, (query) => {
			query.whereNotNull('subjectType');
		});
	}

	/**
	 * Deletes activity rows older than `date`. Scoped to `subject_type IS NOT
	 * NULL` so it can never touch an authentication row — those are security
	 * evidence and are never pruned.
	 */
	async pruneBefore(date: DateTime): Promise<number> {
		const [deletedRowCount] = await AuditEvent.query()
			.whereNotNull('subjectType')
			.where('createdAt', '<', date.toJSDate())
			.delete();

		return Number(deletedRowCount ?? 0);
	}
}
