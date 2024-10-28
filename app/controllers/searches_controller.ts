import { searchTermValidator } from '#validators/search_term';
import type { HttpContext } from '@adonisjs/core/http';
import db from '@adonisjs/lucid/services/db';

export default class SearchesController {
	async search({ request, auth }: HttpContext) {
		const { searchTerm } = await request.validateUsing(searchTermValidator);
		const { rows } = await db.rawQuery('SELECT * FROM search_text(?, ?)', [
			searchTerm,
			auth.user!.id,
		]);
		return { results: rows };
	}
}
