import { BaseTransformer } from '@adonisjs/core/transformers';

import { listAuthMethods } from '#lib/auth/auth_methods';
import { toIsoTimestamp } from '#lib/database/aggregate_timestamp';
import type User from '#models/user';

export default class UserTransformer extends BaseTransformer<User> {
	/**
	 * What anyone who can see a link or a collection learns about its author.
	 */
	toObject() {
		return this.pick(this.resource, ['id', 'fullname']);
	}

	/** The signed-in user's own shared prop: the one place the role is exposed. */
	forSession() {
		return {
			...this.toObject(),
			isAdmin: this.resource.isAdmin,
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
			...this.forSession(),
			createdAt: this.resource.createdAt?.toString(),
			updatedAt: this.resource.updatedAt?.toString(),
			email: this.resource.email,
			emailVerifiedAt: this.resource.emailVerifiedAt?.toString() ?? null,
			pendingDeletionAt: this.resource.pendingDeletionAt?.toString() ?? null,
			pendingDeletionRequestedByAdmin:
				this.resource.pendingDeletionRequestedById !== null,
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
