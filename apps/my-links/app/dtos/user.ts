import { CommonModelDto } from '#dtos/common_model';
import User from '#models/user';

export class UserDto extends CommonModelDto<User> {
	declare id: number;
	declare fullname: string;
	declare avatarUrl: string;
	declare isAdmin: boolean;
	declare createdAt: string | null;
	declare updatedAt: string | null;

	constructor(user?: User) {
		if (!user) return;
		super(user);

		this.id = user.id;
		this.fullname = user.fullname;
		this.avatarUrl = user.avatarUrl;
		this.isAdmin = user.isAdmin;
		this.createdAt = user.createdAt.toISO();
		this.updatedAt = user.updatedAt.toISO();
	}

	serialize(): {
		id: number;
		fullname: string;
		avatarUrl: string;
		isAdmin: boolean;
		createdAt: string | null;
		updatedAt: string | null;
	} {
		return {
			...super.serialize(),
			id: this.id,
			fullname: this.fullname,
			avatarUrl: this.avatarUrl,
			isAdmin: this.isAdmin,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}
}
