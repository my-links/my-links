import { CommonModelDto } from '#dtos/common_model';
import User from '#models/user';

export class UserWithCountersDto extends CommonModelDto<User> {
	declare id: number;
	declare fullname: string;
	declare isAdmin: boolean;
	declare linksCount: number;
	declare collectionsCount: number;
	declare lastSeenAt: string | null;
	declare createdAt: string | null;
	declare updatedAt: string | null;

	constructor(user?: User) {
		if (!user) return;
		super(user);

		this.id = user.id;
		this.fullname = user.fullname;
		this.isAdmin = user.isAdmin;
		this.linksCount = Number(user.$extras.totalLinks);
		this.collectionsCount = Number(user.$extras.totalCollections);
		this.lastSeenAt = user.lastSeenAt?.toString() ?? user.updatedAt.toString();
		this.createdAt = user.createdAt?.toISO();
		this.updatedAt = user.updatedAt?.toISO();
	}

	serialize(): {
		id: number;
		fullname: string;
		isAdmin: boolean;
		linksCount: number;
		collectionsCount: number;
		lastSeenAt: string | null;
		createdAt: string | null;
		updatedAt: string | null;
	} {
		return {
			...super.serialize(),
			id: this.id,
			fullname: this.fullname,
			isAdmin: this.isAdmin,
			linksCount: this.linksCount,
			collectionsCount: this.collectionsCount,
			lastSeenAt: this.lastSeenAt,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}
}
