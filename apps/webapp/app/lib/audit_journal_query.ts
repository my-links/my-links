import AuditEvent from '#models/audit_event';
import { AUDIT_JOURNAL_PAGE_SIZE } from '#constants/audit';

/**
 * The journal query `ActivityEventService.listRecent` and
 * `AuthEventService.listRecent` both build against the same `audit_events`
 * table, differing only in which rows they scope to (`subjectType` null vs
 * not) — everything else, down to the page size, is shared. Both accounts
 * are preloaded because every line names them; reading them row by row would
 * be two round trips per line rendered. The `id` tie-break matters because
 * events written in the same transaction share a timestamp, so the date
 * alone does not order them and a page boundary would be free to show the
 * same row twice.
 */
export function paginateAuditJournal(
	page: number,
	scope: (query: ReturnType<typeof AuditEvent.query>) => void
) {
	const query = AuditEvent.query();
	scope(query);

	return query
		.preload('user')
		.preload('actor')
		.orderBy('createdAt', 'desc')
		.orderBy('id', 'desc')
		.paginate(page, AUDIT_JOURNAL_PAGE_SIZE);
}
