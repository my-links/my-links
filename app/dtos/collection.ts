import { CommonModelDto } from '#dtos/common_model';
import { Visibility } from '#enums/collections/visibility';
import Collection from '#models/collection';

export class CollectionDto extends CommonModelDto<Collection> {
	declare id: number;
	declare name: string;
	declare description: string | null;
	declare visibility: Visibility;
	declare authorId: number;
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
		this.createdAt = collection.createdAt?.toISO();
		this.updatedAt = collection.updatedAt?.toISO();
	}

	serialize(): {
		id: number;
		name: string;
		description: string | null;
		visibility: Visibility;
		authorId: number;
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
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}
}
