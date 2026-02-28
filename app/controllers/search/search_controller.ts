import { SearchService, SearchType } from '#services/search/search_service';
import SearchResultTransformer from '#transformers/search_result';
import { searchValidator } from '#validators/search/search_validator';
import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

@inject()
export default class SearchController {
	constructor(protected readonly searchService: SearchService) {}

	async render({ request, auth }: HttpContext) {
		const { term, type = 'both' } =
			await request.validateUsing(searchValidator);

		const rawResults = await this.searchService.search({
			term,
			type: type as SearchType,
			userId: auth.user!.id,
		});

		const results = SearchResultTransformer.transform(rawResults);
		return { results };
	}
}
