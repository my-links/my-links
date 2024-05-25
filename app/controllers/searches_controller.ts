import type { HttpContext } from '@adonisjs/core/http';
import db from '@adonisjs/lucid/services/db';

export default class SearchesController {
  async search({ request, auth }: HttpContext) {
    const term = request.qs()?.term;
    if (!term) {
      return console.warn('qs term null');
    }

    const { rows } = await db.rawQuery('SELECT * FROM search_text(?, ?)', [
      term,
      auth.user!.id,
    ]);
    return { results: rows };
  }
}
