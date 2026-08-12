import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { journalPageMeta } from '#controllers/admin/actions/journal_page_meta';
import ActivityEventTransformer from '#transformers/activity_event_transformer';
import { journalPageValidator } from '#validators/admin/journal_page_validator';
import { ActivityEventService } from '#services/activity/activity_event_service';

const FIRST_PAGE = 1;

/**
 * The activity journal — what users and administrators did to collections and
 * links, never what those collections and links contained.
 *
 * A page of it, never the whole thing: `audit_events` only grows, and an
 * instance that has been running a year would otherwise render every activity
 * row it ever saw.
 */
@inject()
export default class ActivityJournalController {
	constructor(protected readonly activityEventService: ActivityEventService) {}

	async render({ inertia, request }: HttpContext) {
		const { page } = await request.validateUsing(journalPageValidator, {
			data: request.qs(),
		});

		const events = await this.activityEventService.listRecent(
			page ?? FIRST_PAGE
		);

		return inertia.render('admin/activity_journal', {
			events: ActivityEventTransformer.transform(events.all()),
			...journalPageMeta(events),
		});
	}
}
