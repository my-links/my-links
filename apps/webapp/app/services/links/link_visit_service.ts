import { DateTime } from 'luxon';
import db from '@adonisjs/lucid/services/db';

import Link from '#models/link';
import type User from '#models/user';
import { Visibility } from '#enums/collections/visibility';

const LINKS_TABLE = 'links';

/**
 * Backs the `/l/:id` redirect: every click — from the webapp, the browser
 * extension's sidebar or a shared collection page — is counted in one place,
 * so the ranking that pins favourites to the bookmarks bar sees a single
 * consistent number instead of per-surface tallies.
 */
export class LinkVisitService {
	/**
	 * A link is reachable through the redirect when the visitor owns it, or
	 * when it sits in at least one public collection (the same rule the
	 * shared-collection pages already apply). Anything else is a 404 —
	 * without this, `/l/:id` would turn id enumeration into a way to read
	 * every private link's target URL.
	 */
	async getVisitableLink(
		id: Link['id'],
		visitorId: User['id'] | undefined
	): Promise<Link> {
		return await Link.query()
			.where('id', id)
			.andWhere((query) => {
				query.whereHas('collections', (collectionsQuery) => {
					collectionsQuery.where('visibility', Visibility.PUBLIC);
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
	 * visit onto the delta feed (`GET /api/v1/sync`) — exactly the per-click
	 * churn the ranking is throttled to avoid.
	 */
	async recordVisit(id: Link['id']): Promise<void> {
		await db
			.from(LINKS_TABLE)
			.where('id', id)
			.update({
				clicks: db.raw('clicks + 1'),
				last_clicked_at: DateTime.now().toJSDate(),
			});
	}
}
