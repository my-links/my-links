import vine, { SimpleMessagesProvider } from '@vinejs/vine';

const linkSchema = vine.object({
	name: vine.string().trim().minLength(1).maxLength(254),
	description: vine.string().trim().maxLength(300).nullable().optional(),
	url: vine.string().url({ require_tld: false }).trim(),
	favorite: vine.boolean(),
	// Indexes into the top-level `collections` array — a link can belong to
	// several collections, which don't have a stable id across export/import.
	collectionIndexes: vine.array(vine.number().min(0)),
});

const collectionSchema = vine.object({
	name: vine.string().trim().minLength(1).maxLength(254),
	description: vine.string().trim().maxLength(254).nullable().optional(),
	visibility: vine.string(),
	icon: vine.string().trim().maxLength(10).nullable().optional(),
});

export const importDataValidator = vine.create(
	vine.object({
		collections: vine.array(collectionSchema),
		links: vine.array(linkSchema).optional(),
	})
);

importDataValidator.messagesProvider = new SimpleMessagesProvider({
	'collections.required': 'Collections array is required',
	'collections.*.name.required': 'Collection name is required',
	'links.*.name.required': 'Link name is required',
	'links.*.url.required': 'Link URL is required',
	'links.*.url.url': 'Link URL must be a valid URL',
});
