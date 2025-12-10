import { UserDto } from '#dtos/user';
import User from '#models/user';

export class UserAuthDto {
	declare isAuthenticated: boolean;
	declare isAdmin: boolean;
	declare user?: UserDto;

	constructor(user: User | undefined) {
		if (!user) return;
		this.isAuthenticated = !!user;
		this.isAdmin = user?.isAdmin;
		this.user = user && new UserDto(user);
	}

	serialize(): {
		isAuthenticated: boolean;
		isAdmin: boolean;
		user: ReturnType<UserDto['serialize']> | undefined;
	} {
		return {
			isAuthenticated: this.isAuthenticated,
			isAdmin: this.isAdmin,
			user: this.user?.serialize(),
		};
	}
}
