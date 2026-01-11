import { SearchResultDto, SearchResultsDto } from '#dtos/search_result';
import { SearchService, SearchType } from '#services/search/search_service';
import { searchValidator } from '#validators/search/search_validator';
import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

@inject()
export default class SearchController {
	constructor(private searchService: SearchService) {}

	async render({ request, auth }: HttpContext) {
		const { term, type = 'both' } =
			await request.validateUsing(searchValidator);

		const rawResults = await this.searchService.search({
			term,
			type: type as SearchType,
			userId: auth.user!.id,
		});

		const results = rawResults.map(
			(row) =>
				new SearchResultDto({
					id: row.id,
					type: row.type,
					name: row.name,
					url: row.url,
					collection_id: row.collection_id,
					icon: row.icon,
					matched_part: row.matched_part,
					rank: row.rank,
				})
		);

		const searchResultsDto = new SearchResultsDto(results);

		return searchResultsDto.serialize();
	}
}
