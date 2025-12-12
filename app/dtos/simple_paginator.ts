// Source : https://github.com/adocasts/package-dto/blob/main/src/paginator/simple_paginator_dto.ts

import { CommonModelDto } from '#dtos/common_model';
import AppBaseModel from '#models/app_base_model';
import {
	SimplePaginatorDtoContract,
	SimplePaginatorDtoMetaContract,
	SimplePaginatorDtoMetaRange,
	StaticDto,
} from '#types/dto';
import { LucidRow, ModelPaginatorContract } from '@adonisjs/lucid/types/model';
import { SimplePaginatorContract } from '@adonisjs/lucid/types/querybuilder';

export default class SimplePaginatorDto<
	T extends AppBaseModel,
	TDto extends CommonModelDto<T>,
	TModel = any,
> implements SimplePaginatorDtoContract<TDto>
{
	declare data: TDto[];
	declare meta: SimplePaginatorDtoMetaContract;

	/**
	 * Constructs a new instance of the SimplePaginatorDto class.
	 *
	 * @param {SimplePaginatorContract<Model>|ModelPaginatorContract<Model>} paginator - The paginator object containing the data.
	 * @param {StaticDto<Model, Dto>} dto - The static DTO class used to map the data.
	 * @param {SimplePaginatorDtoMetaRange} [range] - Optional range for the paginator.
	 */
	constructor(
		paginator: TModel extends LucidRow
			? ModelPaginatorContract<TModel>
			: SimplePaginatorContract<TModel>,
		dto: StaticDto<TModel, TDto>,
		range?: SimplePaginatorDtoMetaRange
	) {
		this.data = paginator.all().map((row) => new dto(row));

		this.meta = {
			total: paginator.total,
			perPage: paginator.perPage,
			currentPage: paginator.currentPage,
			lastPage: paginator.lastPage,
			firstPage: paginator.firstPage,
			firstPageUrl: paginator.getUrl(1),
			lastPageUrl: paginator.getUrl(paginator.lastPage),
			nextPageUrl: paginator.getNextPageUrl(),
			previousPageUrl: paginator.getPreviousPageUrl(),
		};

		if (range?.start || range?.end) {
			const start = range?.start || paginator.firstPage;
			const end = range?.end || paginator.lastPage;

			this.meta.pagesInRange = paginator.getUrlsForRange(start, end);
		}
	}

	serialize() {
		return {
			data: this.data.map((item) => item.serialize()),
			meta: this.meta,
		};
	}
}
