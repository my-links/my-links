import ApiToken from '#user/models/api_token';
import User from '#user/models/user';
import { DateTime } from 'luxon';

type CreateApiTokenPayload = {
	user: User;
	name: string;
	expiresAt?: DateTime;
};

export class ApiTokenService {
	async createToken({
		user,
		name,
		expiresAt,
	}: CreateApiTokenPayload): Promise<ApiToken> {
		return await ApiToken.create({
			userId: user.id,
			name,
			expiresAt,
			isActive: true,
		});
	}

	async getUserTokens(userId: number): Promise<ApiToken[]> {
		return await ApiToken.query()
			.where('userId', userId)
			.orderBy('created_at', 'desc');
	}

	async revokeToken(tokenId: number, userId: number): Promise<void> {
		const token = await ApiToken.query()
			.where('id', tokenId)
			.where('userId', userId)
			.firstOrFail();

		token.isActive = false;
		await token.save();
	}

	async validateToken(tokenString: string): Promise<ApiToken | null> {
		const token = await ApiToken.query()
			.where('token', tokenString)
			.where('isActive', true)
			.first();

		if (!token || !token.isValid()) {
			return null;
		}

		await token.markAsUsed();
		return token;
	}
}
