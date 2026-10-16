import vine from '@vinejs/vine';

import { API_TOKEN_EXPIRIES, API_TOKEN_SCOPES } from '#constants/api_token';

export const createApiTokenValidator = vine.create(
	vine.object({
		name: vine.string().trim().minLength(1).maxLength(255),
		expiry: vine.enum(API_TOKEN_EXPIRIES).optional(),
		scope: vine.enum(API_TOKEN_SCOPES).optional(),
	})
);
