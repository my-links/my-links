import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { UnAuthorizedException } from '#exceptions/api/tokens/un_authorized_exception';
import { getTokenFromHeader } from '#lib/api/tokens/index';

@inject()
export default class CheckApiTokenController {
	async render(ctx: HttpContext) {
		const token = getTokenFromHeader(ctx);
		const user = ctx.auth.use('api').user;
		if (!token || !user) {
			throw new UnAuthorizedException();
		}

		return ctx.response.json({
			message: 'Token is valid',
			userId: user.id,
		});
	}
}
