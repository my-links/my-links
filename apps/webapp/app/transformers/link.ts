import { BaseTransformer } from '@adonisjs/core/transformers';

import type Link from '#models/link';
import UserTransformer from '#transformers/user';

export default class LinkTransformer extends BaseTransformer<Link> {
	toObject() {
		return {
			id: this.resource.id,
			name: this.resource.name,
			description: this.resource.description ?? null,
			url: this.resource.url,
			favorite: this.resource.favorite,
			clicks: this.resource.clicks,
			lastClickedAt: this.resource.lastClickedAt?.toString() ?? null,
			authorId: this.resource.authorId,
			author: UserTransformer.transform(this.whenLoaded(this.resource.author)),
			createdAt: this.resource.createdAt?.toString(),
			updatedAt: this.resource.updatedAt?.toString(),
		};
	}

	withCollections() {
		return {
			...this.toObject(),
			collectionIds: (this.resource.collections ?? []).map(
				(collection) => collection.id
			),
		};
	}
}
