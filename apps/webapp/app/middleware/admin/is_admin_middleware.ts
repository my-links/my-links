import type { HttpContext } from '@adonisjs/core/http';
import type { NextFn } from '@adonisjs/core/types/http';

import AdminAccessRequiredException from '#exceptions/admin/admin_access_required_exception';

export default class AdminMiddleware {
	async handle(ctx: HttpContext, next: NextFn) {
		if (!ctx.auth.user?.isAdmin) {
			throw new AdminAccessRequiredException();
		}

		return next();
	}
}
