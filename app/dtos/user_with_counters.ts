import { CommonModelDto } from '#dtos/common_model';
import User from '#models/user';

export class UserWithCountersDto extends CommonModelDto<User> {
	declare id: number;
	declare email: string;
	declare fullname: string;
	declare avatarUrl: string;
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
		this.email = user.email;
		this.fullname = user.fullname;
		this.avatarUrl = user.avatarUrl;
		this.isAdmin = user.isAdmin;
		this.linksCount = Number(user.$extras.totalLinks);
		this.collectionsCount = Number(user.$extras.totalCollections);
		this.lastSeenAt = user.lastSeenAt?.toString() ?? user.updatedAt.toString();
		this.createdAt = user.createdAt?.toISO();
		this.updatedAt = user.updatedAt?.toISO();
	}

	serialize(): {
		id: number;
		email: string;
		fullname: string;
		avatarUrl: string;
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
			email: this.email,
			fullname: this.fullname,
			avatarUrl: this.avatarUrl,
			isAdmin: this.isAdmin,
			linksCount: this.linksCount,
			collectionsCount: this.collectionsCount,
			lastSeenAt: this.lastSeenAt,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}
}
