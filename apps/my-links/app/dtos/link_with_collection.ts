import { CollectionDto } from '#dtos/collection';
import { CommonModelDto } from '#dtos/common_model';
import Link from '#models/link';
import { Collection } from '#shared/types/dto';

export class LinkWithCollectionDto extends CommonModelDto<Link> {
	declare id: number;
	declare name: string;
	declare description: string | null;
	declare url: string;
	declare favorite: boolean;
	declare collectionId: number;
	declare collection: CollectionDto;
	declare authorId: number;
	declare createdAt: string | null;
	declare updatedAt: string | null;

	constructor(link?: Link) {
		if (!link) return;
		super(link);

		this.id = link.id;
		this.name = link.name;
		this.description = link.description;
		this.url = link.url;
		this.favorite = link.favorite;
		this.collectionId = link.collectionId;
		this.collection = new CollectionDto(link.collection);
		this.authorId = link.authorId;
		this.createdAt = link.createdAt?.toISO();
		this.updatedAt = link.updatedAt?.toISO();
	}

	serialize(): {
		id: number;
		name: string;
		description: string | null;
		url: string;
		favorite: boolean;
		collectionId: number;
		collection: Collection;
		authorId: number;
		createdAt: string | null;
		updatedAt: string | null;
	} {
		return {
			...super.serialize(),
			id: this.id,
			name: this.name,
			description: this.description,
			url: this.url,
			favorite: this.favorite,
			collectionId: this.collectionId,
			collection: this.collection.serialize(),
			authorId: this.authorId,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}
}
