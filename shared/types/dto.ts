import { CollectionDto } from '#dtos/collection';
import { CollectionWithLinksDto } from '#dtos/collection_with_links';
import { LinkDto } from '#dtos/link';
import { LinkWithCollectionDto } from '#dtos/link_with_collection';
import { SharedCollectionDto } from '#dtos/shared_collection';
import { UserDto } from '#dtos/user';
import { UserAuthDto } from '#dtos/user_auth';
import { UserWithCountersDto } from '#dtos/user_with_counters';

export type User = ReturnType<UserDto['serialize']>;
export type UserAuth = ReturnType<UserAuthDto['serialize']>;
export type UserWithCounters = ReturnType<UserWithCountersDto['serialize']>;
export type Collection = ReturnType<CollectionDto['serialize']>;
export type SharedCollection = ReturnType<SharedCollectionDto['serialize']>;
export type CollectionWithLinks = ReturnType<
	CollectionWithLinksDto['serialize']
>;
export type Link = ReturnType<LinkDto['serialize']>;
export type LinkWithCollection = ReturnType<LinkWithCollectionDto['serialize']>;
