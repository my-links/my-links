import { CommonModelDto } from '#dtos/common_model';
import { LinkDto } from '#dtos/link';
import { Visibility } from '#enums/collections/visibility';
import Collection from '#models/collection';
import { Link } from '#shared/types/dto';

export class CollectionWithLinksDto extends CommonModelDto<Collection> {
	declare id: number;
	declare name: string;
	declare description: string | null;
	declare visibility: Visibility;
	declare authorId: number;
	declare links: LinkDto[];
	declare createdAt: string | null;
	declare updatedAt: string | null;

	constructor(collection?: Collection) {
		if (!collection) return;
		super(collection);

		this.id = collection.id;
		this.name = collection.name;
		this.description = collection.description;
		this.visibility = collection.visibility;
		this.authorId = collection.authorId;
		this.links = LinkDto.fromArray(collection.links);
		this.createdAt = collection.createdAt?.toISO();
		this.updatedAt = collection.updatedAt?.toISO();
	}

	serialize(): {
		id: number;
		name: string;
		description: string | null;
		visibility: Visibility;
		authorId: number;
		links: Link[];
		createdAt: string | null;
		updatedAt: string | null;
	} {
		return {
			...super.serialize(),
			id: this.id,
			name: this.name,
			description: this.description,
			visibility: this.visibility,
			authorId: this.authorId,
			links: this.links.map((link) => link.serialize()),
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}
}
