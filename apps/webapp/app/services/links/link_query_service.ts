import { inject } from '@adonisjs/core';
import db from '@adonisjs/lucid/services/db';

import Link from '#models/link';
import type User from '#models/user';

@inject()
export class LinkQueryService {
	async getLinkById(id: Link['id'], userId: Link['id']) {
		return await Link.query()
			.where('id', id)
			.apply((scopes) => scopes.ownedBy(userId))
			.preload('collections')
			.firstOrFail();
	}

	async getMyFavoriteLinks(userId: User['id']) {
		return await Link.query()
			.where('author_id', userId)
			.where('favorite', true)
			.preload('collections')
			.orderBy('created_at');
	}

	async hasFavoriteLinks(userId: User['id']): Promise<boolean> {
		const favoriteLink = await Link.query()
			.where('author_id', userId)
			.where('favorite', true)
			.select('id')
			.first();

		return favoriteLink !== null;
	}

	/**
	 * Feeds the search modal's client-side matcher and its link controls
	 * menu, which needs `collectionIds` to link to a result's collection.
	 */
	async getMyLinks(userId: User['id']) {
		return await Link.query()
			.where('author_id', userId)
			.preload('collections')
			.orderBy('name');
	}

	/**
	 * Backs the `links.search` MCP tool: an MCP client has no access to the
	 * webapp's client-side fuzzy matcher, so this is a small server-side
	 * substitute rather than an attempt to match its ranking.
	 */
	async searchLinks(userId: User['id'], term: string) {
		const pattern = `%${term}%`;
		return await Link.query()
			.where('author_id', userId)
			.where((query) => {
				query
					.whereILike('name', pattern)
					.orWhereILike('url', pattern)
					.orWhereILike('description', pattern);
			})
			.preload('collections')
			.orderBy('name');
	}

	async getTotalLinksCount() {
		const totalCount = await db.from('links').count('* as total');
		return Number(totalCount[0].total);
	}
}
