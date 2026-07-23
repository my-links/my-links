import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { SearchService } from '#services/search/search_service';
import SearchResultTransformer from '#transformers/search_result';
import { searchValidator } from '#validators/search/search_validator';

@inject()
export default class SearchController {
	constructor(protected readonly searchService: SearchService) {}

	async render({ request, auth, response }: HttpContext) {
		const { term, type = 'both' } =
			await request.validateUsing(searchValidator);

		const rawResults = await this.searchService.search({
			term,
			type,
			userId: auth.user!.id,
		});

		return response.json({
			results: SearchResultTransformer.transform(rawResults),
		});
	}
}
