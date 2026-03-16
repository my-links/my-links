import User from '#models/user';

type CreateTokenParams = {
	name: string;
	expiresAt?: Date;
};

export class ApiTokenService {
	createToken(user: User, { name, expiresAt }: CreateTokenParams) {
		const expiresIn = expiresAt ? expiresAt.getTime() - Date.now() : undefined;
		return User.accessTokens.create(user, undefined, {
			name,
			expiresIn,
		});
	}

	getTokens(user: User) {
		return User.accessTokens.all(user);
	}

	revokeToken(user: User, identifier: number) {
		return User.accessTokens.delete(user, identifier);
	}

	getTokenByValue(user: User, value: string) {
		return User.accessTokens.find(user, value);
	}
}
