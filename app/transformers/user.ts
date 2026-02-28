import type User from '#models/user';
import { BaseTransformer } from '@adonisjs/core/transformers';

export default class UserTransformer extends BaseTransformer<User> {
	toObject() {
		return {
			...this.pick(this.resource, ['id', 'fullname', 'avatarUrl', 'isAdmin']),
			createdAt: this.whenLoaded(this.resource.createdAt?.toString()),
			updatedAt: this.whenLoaded(this.resource.updatedAt?.toString()),
		};
	}

	withCounters() {
		return {
			...this.toObject(),
			lastSeenAt: this.whenLoaded(this.resource.lastSeenAt?.toString()),
			linksCount: Number(this.resource.$extras.totalLinks),
			collectionsCount: Number(this.resource.$extras.totalCollections),
		};
	}
}
