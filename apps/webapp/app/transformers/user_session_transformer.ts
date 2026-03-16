import type UserSession from '#models/user_session';
import { BaseTransformer } from '@adonisjs/core/transformers';

export default class UserSessionTransformer extends BaseTransformer<UserSession> {
	toObject() {
		const client = this.resource.client;
		return {
			sessionId: this.resource.id,
			ip: client?.ip,
			browser: client?.browser,
			engine: client?.engine,
			createdAt: this.resource.createdAt?.toString(),
			expiresAt: this.resource.expiresAt?.toString(),
		};
	}
}
