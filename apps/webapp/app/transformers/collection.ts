import { HttpContext } from '@adonisjs/core/http';
import { BaseTransformer } from '@adonisjs/core/transformers';

import type Collection from '#models/collection';
import LinkTransformer from '#transformers/link';
import UserTransformer from '#transformers/user';

export default class CollectionTransformer extends BaseTransformer<Collection> {
	toObject() {
		const ctx = HttpContext.getOrFail();
		const userId = ctx.auth.user?.id;
		const isOwner = userId ? userId === this.resource.authorId : false;
		return {
			id: this.resource.id,
			name: this.resource.name,
			description: this.resource.description ?? null,
			visibility: this.resource.visibility,
			authorId: this.resource.authorId,
			icon: this.resource.icon ?? null,
			isDefault: this.resource.isDefault,
			author: UserTransformer.transform(this.whenLoaded(this.resource.author)),
			isOwner,
			linksCount: this.when(
				this.resource.$extras.linksCount !== undefined,
				() => Number(this.resource.$extras.linksCount)
			),
			followersCount: this.when(
				this.resource.$extras.followersCount !== undefined,
				() => Number(this.resource.$extras.followersCount)
			),
			createdAt: this.resource.createdAt?.toString(),
			updatedAt: this.resource.updatedAt?.toString(),
		};
	}

	withLinks() {
		const base = this.toObject();
		const links = this.whenLoaded(this.resource.links);

		// Only the owner may see which OTHER collections a link belongs to —
		// followers/anonymous visitors of a shared collection get bare links.
		return {
			...base,
			links: base.isOwner
				? LinkTransformer.transform(links)?.useVariant('withCollections')
				: LinkTransformer.transform(links),
		};
	}

	/**
	 * Same as `withLinks()`, but for call sites that only ever query the
	 * authenticated user's own collections (e.g. `author_id` is part of the
	 * query itself) — no owner/follower branch to resolve. Kept separate so
	 * the OpenAPI generator can infer a concrete `collectionIds` type here,
	 * which it can't do across `withLinks()`'s conditional variant.
	 */
	withOwnLinks() {
		return {
			...this.toObject(),
			position: this.resource.position,
			links: LinkTransformer.transform(
				this.whenLoaded(this.resource.links)
			)?.useVariant('withCollections'),
		};
	}
}
