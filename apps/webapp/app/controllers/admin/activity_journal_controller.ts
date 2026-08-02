import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import ActivityEventTransformer from '#transformers/activity_event_transformer';
import { ActivityEventService } from '#services/activity/activity_event_service';
import { activityJournalPageValidator } from '#validators/admin/activity_journal_page_validator';

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
		const { page } = await request.validateUsing(activityJournalPageValidator, {
			data: request.qs(),
		});

		const events = await this.activityEventService.listRecent(
			page ?? FIRST_PAGE
		);
		const { currentPage, lastPage, total } = events.getMeta();

		return inertia.render('admin/activity_journal', {
			events: ActivityEventTransformer.transform(events.all()),
			currentPage: Number(currentPage),
			lastPage: Number(lastPage),
			totalEvents: Number(total),
		});
	}
}
