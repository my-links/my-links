import UnAuthorizedException from '#exceptions/api/tokens/un_authorized_exception';
import { getTokenFromHeader } from '#lib/api/tokens/index';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

@inject()
export default class ApiTokenController {
	async render(ctx: HttpContext) {
		const token = getTokenFromHeader(ctx);
		if (!token) {
			throw new UnAuthorizedException();
		}

		return ctx.response.json({
			message: 'Token is valid',
		});
	}
}
