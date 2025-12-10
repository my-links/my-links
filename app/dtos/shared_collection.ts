import { CommonModelDto } from '#dtos/common_model';
import { LinkDto } from '#dtos/link';
import { UserDto } from '#dtos/user';
import { Visibility } from '#enums/collections/visibility';
import Collection from '#models/collection';
import { Link, User } from '#shared/types/dto';

export class SharedCollectionDto extends CommonModelDto<Collection> {
	declare id: number;
	declare name: string;
	declare description: string | null;
	declare visibility: Visibility;
	declare links: LinkDto[];
	declare authorId: number;
	declare author: UserDto;
	declare createdAt: string | null;
	declare updatedAt: string | null;

	constructor(collection?: Collection) {
		if (!collection) return;
		super(collection);

		this.id = collection.id;
		this.name = collection.name;
		this.description = collection.description;
		this.visibility = collection.visibility;
		this.links = LinkDto.fromArray(collection.links);
		this.authorId = collection.authorId;
		this.author = new UserDto(collection.author);
		this.createdAt = collection.createdAt?.toISO();
		this.updatedAt = collection.updatedAt?.toISO();
	}

	serialize(): {
		id: number;
		name: string;
		description: string | null;
		visibility: Visibility;
		links: Link[];
		authorId: number;
		author: User;
		createdAt: string | null;
		updatedAt: string | null;
	} {
		return {
			...super.serialize(),
			id: this.id,
			name: this.name,
			description: this.description,
			visibility: this.visibility,
			links: this.links.map((link) => link.serialize()),
			authorId: this.authorId,
			author: this.author.serialize(),
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}
}
