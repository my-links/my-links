import type Collection from '#models/collection';
import LinkTransformer from '#transformers/link';
import UserTransformer from '#transformers/user';
import { HttpContext } from '@adonisjs/core/http';
import { BaseTransformer } from '@adonisjs/core/transformers';

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
			author: UserTransformer.transform(this.whenLoaded(this.resource.author)),
			isOwner,
			createdAt: this.whenLoaded(this.resource.createdAt?.toString()),
			updatedAt: this.whenLoaded(this.resource.updatedAt?.toString()),
		};
	}

	withLinks() {
		return {
			...this.toObject(),
			links: LinkTransformer.transform(this.whenLoaded(this.resource.links)),
		};
	}
}
