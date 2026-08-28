import vine, { SimpleMessagesProvider } from '@vinejs/vine';

const linkFields = {
	name: vine.string().trim().minLength(1).maxLength(254),
	description: vine.string().trim().maxLength(300).nullable().optional(),
	url: vine.string().url({ require_tld: false, validate_length: false }).trim(),
	favorite: vine.boolean(),
};

// Current format: links live at the top level and reference collections by
// the per-collection `key` in the `collections` array (a link can belong to
// several). `collectionIndexes` is still accepted for files exported before
// keys existed — see ExportImportService.importUserData.
const topLevelLinkSchema = vine.object({
	...linkFields,
	collectionKeys: vine.array(vine.string().trim().minLength(1)).optional(),
	collectionIndexes: vine.array(vine.number().min(0)).optional(),
});

// Legacy format (pre multi-collection): links are nested under a single
// collection with no index/key references. Still accepted so old export
// files keep importing — see ExportImportService.importUserData.
const nestedLinkSchema = vine.object(linkFields);

const collectionSchema = vine.object({
	// Present on files exported after per-collection keys were introduced;
	// absent on older exports, which fall back to index-based matching.
	key: vine.string().trim().minLength(1).optional(),
	name: vine.string().trim().minLength(1).maxLength(254),
	description: vine.string().trim().maxLength(254).nullable().optional(),
	visibility: vine.string(),
	icon: vine.string().trim().maxLength(10).nullable().optional(),
	links: vine.array(nestedLinkSchema).optional(),
});

export const importDataValidator = vine.create(
	vine.object({
		collections: vine.array(collectionSchema),
		links: vine.array(topLevelLinkSchema).optional(),
	})
);

importDataValidator.messagesProvider = new SimpleMessagesProvider({
	'collections.required': 'Collections array is required',
	'collections.*.name.required': 'Collection name is required',
	'collections.*.links.*.name.required': 'Link name is required',
	'collections.*.links.*.url.required': 'Link URL is required',
	'collections.*.links.*.url.url': 'Link URL must be a valid URL',
	'links.*.name.required': 'Link name is required',
	'links.*.url.required': 'Link URL is required',
	'links.*.url.url': 'Link URL must be a valid URL',
});
