import db from '@adonisjs/lucid/services/db';
import { DateTime } from 'luxon';

import Link from '#models/link';
import type User from '#models/user';

const LINKS_TABLE = 'links';

/**
 * Backs the `POST /l/:id` beacon: every click an owner makes (from the
 * webapp, the browser extension's sidebar or their own shared collection
 * page) is counted in one place, so
 * the ranking that pins favourites to the bookmarks bar sees a single
 * consistent number instead of per-surface tallies. Visitors never move a
 * link's counter.
 */
export class LinkVisitService {
	/**
	 * A link is reachable through the beacon when the visitor owns it, or
	 * when it sits in at least one public collection (the same rule the
	 * shared-collection pages already apply). Anything else is a 404, so
	 * the beacon never confirms that a private link id exists.
	 */
	async getVisitableLink(
		id: Link['id'],
		visitorId: User['id'] | undefined
	): Promise<Link> {
		return Link.query()
			.where('id', id)
			.andWhere((query) => {
				query.whereHas('collections', (collectionsQuery) => {
					collectionsQuery.apply((scopes) => scopes.publiclyVisible());
				});

				if (visitorId !== undefined) {
					query.orWhere('author_id', visitorId);
				}
			})
			.firstOrFail();
	}

	/**
	 * Deliberately writes through a bare `update()` so `updated_at` stays
	 * put: a click is not a content change, and bumping it would push every
	 * visit onto the delta feed (`GET /api/v1/sync`), exactly the per-click
	 * churn the ranking is throttled to avoid. Only the owner's clicks count:
	 * the counter ranks the owner's own favourites, and anyone could otherwise
	 * inflate it on a public link.
	 */
	async recordVisit(
		link: Link,
		visitorId: User['id'] | undefined
	): Promise<void> {
		if (visitorId === undefined || link.authorId !== visitorId) {
			return;
		}

		await db
			.from(LINKS_TABLE)
			.where('id', link.id)
			.update({
				clicks: db.raw('clicks + 1'),
				last_clicked_at: DateTime.now().toJSDate(),
			});
	}
}
