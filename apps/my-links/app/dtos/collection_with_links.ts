import { CommonModelDto } from '#dtos/common_model';
import { LinkDto } from '#dtos/link';
import { UserDto } from '#dtos/user';
import { Visibility } from '#enums/collections/visibility';
import Collection from '#models/collection';
import { Link, User } from '#shared/types/dto';

export class CollectionWithLinksDto extends CommonModelDto<Collection> {
	declare id: number;
	declare name: string;
	declare description: string | null;
	declare visibility: Visibility;
	declare authorId: number;
	declare author?: UserDto;
	declare links: LinkDto[];
	declare icon: string | null;
	declare createdAt: string | null;
	declare updatedAt: string | null;
	declare isOwner?: boolean;

	constructor(collection?: Collection) {
		if (!collection) return;
		super(collection);

		this.id = collection.id;
		this.name = collection.name;
		this.description = collection.description;
		this.visibility = collection.visibility;
		this.authorId = collection.authorId;
		this.icon = collection.icon;
		this.links = LinkDto.fromArray(collection.links);
		this.author = collection.author
			? new UserDto(collection.author)
			: undefined;
		this.createdAt = collection.createdAt?.toISO();
		this.updatedAt = collection.updatedAt?.toISO();
	}

	serialize(): {
		id: number;
		name: string;
		description: string | null;
		visibility: Visibility;
		authorId: number;
		author?: User;
		links: Link[];
		icon: string | null;
		createdAt: string | null;
		updatedAt: string | null;
		isOwner?: boolean;
	} {
		return {
			...super.serialize(),
			id: this.id,
			name: this.name,
			description: this.description,
			visibility: this.visibility,
			authorId: this.authorId,
			author: this.author?.serialize(),
			links: this.links.map((link) => link.serialize()),
			icon: this.icon,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
			isOwner: this.isOwner,
		};
	}
}
