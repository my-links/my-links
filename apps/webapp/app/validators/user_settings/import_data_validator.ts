import vine, { SimpleMessagesProvider } from '@vinejs/vine';

import { MAXIMUM_URL_LENGTH } from '#constants/link';
import { emojiRule } from '#validators/rules/emoji_rule';
import { VISIBILITY } from '#enums/collections/visibility';
import { linkUrlSchema } from '#validators/links/link_url_validator';
import {
	MAXIMUM_IMPORT_LINKS,
	MAXIMUM_IMPORT_COLLECTIONS,
} from '#constants/data_import';

const linkFields = {
	name: vine.string().trim().minLength(1).maxLength(254),
	description: vine.string().trim().maxLength(300).nullable().optional(),
	url: linkUrlSchema,
	favorite: vine.boolean(),
};

// Current format: links live at the top level and reference collections by
// the per-collection `key` in the `collections` array (a link can belong to
// several). `collectionIndexes` is still accepted for files exported before
// keys existed: see UserDataImportService.importUserData.
const topLevelLinkSchema = vine.object({
	...linkFields,
	collectionKeys: vine
		.array(vine.string().trim().minLength(1))
		.maxLength(MAXIMUM_IMPORT_COLLECTIONS)
		.optional(),
	collectionIndexes: vine
		.array(vine.number().withoutDecimals().min(0))
		.maxLength(MAXIMUM_IMPORT_COLLECTIONS)
		.optional(),
});

// Legacy format (pre multi-collection): links are nested under a single
// collection with no index/key references. Still accepted so old export
// files keep importing, see UserDataImportService.importUserData.
const nestedLinkSchema = vine.object(linkFields);

const collectionSchema = vine.object({
	// Present on files exported after per-collection keys were introduced;
	// absent on older exports, which fall back to index-based matching.
	key: vine.string().trim().minLength(1).optional(),
	name: vine.string().trim().minLength(1).maxLength(254),
	description: vine.string().trim().maxLength(254).nullable().optional(),
	visibility: vine.enum(VISIBILITY),
	icon: vine
		.string()
		.trim()
		.maxLength(10)
		.use(emojiRule())
		.nullable()
		.optional(),
	links: vine
		.array(nestedLinkSchema)
		.maxLength(MAXIMUM_IMPORT_LINKS)
		.optional(),
});

export const importDataValidator = vine.create(
	vine.object({
		collections: vine
			.array(collectionSchema)
			.maxLength(MAXIMUM_IMPORT_COLLECTIONS),
		links: vine
			.array(topLevelLinkSchema)
			.maxLength(MAXIMUM_IMPORT_LINKS)
			.optional(),
	})
);

importDataValidator.messagesProvider = new SimpleMessagesProvider({
	'collections.required': 'Collections array is required',
	'collections.*.name.required': 'Collection name is required',
	'collections.*.links.*.name.required': 'Link name is required',
	'collections.*.links.*.url.required': 'Link URL is required',
	'collections.*.links.*.url.url': 'Link URL must be a valid URL',
	'collections.*.visibility.enum':
		'Collection visibility must be PUBLIC or PRIVATE',
	'collections.*.icon.emoji': 'The icon field must be a valid emoji',
	'collections.*.links.*.url.maxLength': `Link URL must be at most ${MAXIMUM_URL_LENGTH} characters`,
	'links.*.name.required': 'Link name is required',
	'links.*.url.required': 'Link URL is required',
	'links.*.url.url': 'Link URL must be a valid URL',
	'links.*.url.maxLength': `Link URL must be at most ${MAXIMUM_URL_LENGTH} characters`,
});
