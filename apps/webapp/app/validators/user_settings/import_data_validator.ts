import vine, { SimpleMessagesProvider } from '@vinejs/vine';

const linkSchema = vine.object({
	name: vine.string().trim().minLength(1).maxLength(254),
	description: vine.string().trim().maxLength(300).nullable().optional(),
	url: vine.string().url({ require_tld: false }).trim(),
	favorite: vine.boolean(),
});

const collectionSchema = vine.object({
	name: vine.string().trim().minLength(1).maxLength(254),
	description: vine.string().trim().maxLength(254).nullable().optional(),
	visibility: vine.string(),
	icon: vine.string().trim().maxLength(10).nullable().optional(),
	links: vine.array(linkSchema).optional(),
});

export const importDataValidator = vine.create(
	vine.object({
		collections: vine.array(collectionSchema),
	})
);

importDataValidator.messagesProvider = new SimpleMessagesProvider({
	'collections.required': 'Collections array is required',
	'collections.*.name.required': 'Collection name is required',
	'collections.*.links.*.name.required': 'Link name is required',
	'collections.*.links.*.url.required': 'Link URL is required',
	'collections.*.links.*.url.url': 'Link URL must be a valid URL',
});
