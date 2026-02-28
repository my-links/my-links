import type Link from '#models/link';
import CollectionTransformer from '#transformers/collection';
import UserTransformer from '#transformers/user';
import { BaseTransformer } from '@adonisjs/core/transformers';

export default class LinkTransformer extends BaseTransformer<Link> {
	toObject() {
		return {
			id: this.resource.id,
			name: this.resource.name,
			description: this.resource.description ?? null,
			url: this.resource.url,
			favorite: this.resource.favorite,
			collectionId: this.resource.collectionId,
			authorId: this.resource.authorId,
			author: UserTransformer.transform(this.whenLoaded(this.resource.author)),
			createdAt: this.whenLoaded(this.resource.createdAt?.toString()),
			updatedAt: this.whenLoaded(this.resource.updatedAt?.toString()),
		};
	}

	withCollection() {
		return {
			...this.toObject(),
			collection: CollectionTransformer.transform(
				this.whenLoaded(this.resource.collection)
			),
		};
	}
}
