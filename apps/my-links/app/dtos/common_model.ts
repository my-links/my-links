import SimplePaginatorDto from '#dtos/simple_paginator';
import AppBaseModel from '#models/app_base_model';
import { SimplePaginatorDtoMetaRange, StaticDto } from '#types/dto';
import { LucidRow, ModelPaginatorContract } from '@adonisjs/lucid/types/model';
import { SimplePaginatorContract } from '@adonisjs/lucid/types/querybuilder';

export abstract class CommonModelDto<T extends AppBaseModel> {
	declare id: number;
	declare createdAt: string | null;
	declare updatedAt: string | null;

	constructor(model?: T) {
		if (!model) return;
		this.id = model.id;
		this.createdAt = model.createdAt?.toISO();
		this.updatedAt = model.updatedAt?.toISO();
	}

	static fromArray<
		T extends AppBaseModel,
		TDto extends CommonModelDto<T>,
		TModel = any,
	>(
		this: new (model: TModel, ...args: any[]) => TDto,
		models: TModel[],
		...args: any[]
	): TDto[] {
		if (!Array.isArray(models)) return [];
		return models.map((model) => new this(model, ...args));
	}

	static fromPaginator<
		T extends AppBaseModel,
		TDto extends CommonModelDto<T>,
		TModel = any,
	>(
		this: StaticDto<TModel, TDto>,
		paginator: TModel extends LucidRow
			? ModelPaginatorContract<TModel>
			: SimplePaginatorContract<TModel>,
		range?: SimplePaginatorDtoMetaRange
	) {
		return new SimplePaginatorDto(paginator, this, range);
	}

	serialize(): {
		id: number;
		createdAt: string | null;
		updatedAt: string | null;
	} {
		return {
			id: this.id,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}
}
