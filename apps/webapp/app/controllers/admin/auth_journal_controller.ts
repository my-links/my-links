import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { AuthEventService } from '#services/auth/auth_event_service';
import AuthEventTransformer from '#transformers/auth_event_transformer';
import { authJournalPageValidator } from '#validators/admin/auth_journal_page_validator';

const FIRST_PAGE = 1;

/**
 * The authentication journal — what makes an intrusion visible after the fact.
 *
 * A page of it, never the whole thing: `auth_events` only grows, and an
 * instance that has been running a year would otherwise render every sign-in
 * it ever saw.
 */
@inject()
export default class AuthJournalController {
	constructor(protected readonly authEventService: AuthEventService) {}

	async render({ inertia, request }: HttpContext) {
		const { page } = await request.validateUsing(authJournalPageValidator, {
			data: request.qs(),
		});

		const events = await this.authEventService.listRecent(page ?? FIRST_PAGE);
		const { currentPage, lastPage, total } = events.getMeta();

		return inertia.render('admin/auth_journal', {
			events: AuthEventTransformer.transform(events.all()),
			currentPage: Number(currentPage),
			lastPage: Number(lastPage),
			totalEvents: Number(total),
		});
	}
}
