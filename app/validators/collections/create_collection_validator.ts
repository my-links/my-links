import { Visibility } from '#enums/collections/visibility';
import { emojiRule } from '#validators/rules/emoji_rule';
import vine, { SimpleMessagesProvider } from '@vinejs/vine';

export const createCollectionValidator = vine.create(
	vine.object({
		name: vine.string().trim().minLength(1).maxLength(254),
		description: vine.string().trim().maxLength(254).nullable(),
		visibility: vine.enum(Visibility),
		icon: vine
			.string()
			.trim()
			.maxLength(10)
			.use(emojiRule())
			.nullable()
			.optional(),
	})
);

createCollectionValidator.messagesProvider = new SimpleMessagesProvider({
	name: 'Collection name is required',
	'visibility.required': 'Collection visibiliy is required',
	'icon.emoji': 'The icon field must be a valid emoji',
});
