import { BaseTransformer } from '@adonisjs/core/transformers';

import type User from '#models/user';
import { listAuthMethods } from '#lib/auth/auth_methods';
import { toIsoTimestamp } from '#lib/database/aggregate_timestamp';

export default class UserTransformer extends BaseTransformer<User> {
	toObject() {
		return {
			...this.pick(this.resource, ['id', 'fullname', 'isAdmin']),
			createdAt: this.resource.createdAt?.toString(),
			updatedAt: this.resource.updatedAt?.toString(),
		};
	}

	/**
	 * What the admin dashboard needs, and nothing else does.
	 *
	 * The address and the sign-in state live in this variant alone: the base
	 * shape is what a link or a collection says about its author, and that is
	 * read by everyone who can see one.
	 */
	withCounters() {
		return {
			...this.toObject(),
			email: this.resource.email,
			emailVerifiedAt: this.resource.emailVerifiedAt?.toString() ?? null,
			authMethods: listAuthMethods(this.resource),
			lastLoginAt: toIsoTimestamp(this.resource.$extras.lastLoginAt),
			lastSeenAt: this.resource.lastSeenAt?.toString(),
			linksCount: Number(this.resource.$extras.totalLinks),
			collectionsCount: Number(this.resource.$extras.totalCollections),
			followedCollectionsCount: Number(
				this.resource.$extras.totalFollowedCollections
			),
		};
	}
}
