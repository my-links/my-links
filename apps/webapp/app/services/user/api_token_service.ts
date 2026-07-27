import User from '#models/user';
import ApiTokenNotFoundException from '#exceptions/user/api_token_not_found_exception';

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

	/**
	 * Drops every access token the account has.
	 *
	 * A browser extension holds a bearer token that outlives any session, so a
	 * password change that only cleared sessions would leave the compromised
	 * access it was meant to cut exactly where it was. The owner pairs their
	 * extension again — that is the intended cost.
	 */
	async revokeAllTokens(user: User): Promise<void> {
		const tokens = await User.accessTokens.all(user);

		await Promise.all(
			tokens.map((token) =>
				User.accessTokens.delete(user, Number(token.identifier))
			)
		);
	}

	/**
	 * The lookup is what scopes a revocation to its owner: `accessTokens.find`
	 * only returns tokens belonging to the user handed in, so an identifier
	 * from another account is a miss instead of a deletion.
	 */
	async revokeToken(user: User, tokenId: string): Promise<void> {
		const token = await User.accessTokens.find(user, tokenId);

		if (!token) {
			throw new ApiTokenNotFoundException();
		}

		await User.accessTokens.delete(user, Number(token.identifier));
	}
}
