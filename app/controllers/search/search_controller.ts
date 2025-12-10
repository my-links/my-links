import type { HttpContext } from '@adonisjs/core/http';
import db from '@adonisjs/lucid/services/db';

export default class SearchController {
	async render({ request, auth }: HttpContext) {
		const term = request.qs()?.term;
		if (!term) {
			console.warn('qs term null');
			return { error: 'missing "term" query param' };
		}

		const { rows } = await db.rawQuery('SELECT * FROM search_text(?, ?)', [
			term,
			auth.user!.id,
		]);
		return { results: rows };
	}
}
