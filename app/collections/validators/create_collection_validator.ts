import { Visibility } from '#collections/enums/visibility';
import vine, { SimpleMessagesProvider } from '@vinejs/vine';

export const createCollectionValidator = vine.compile(
	vine.object({
		name: vine.string().trim().minLength(1).maxLength(254),
		description: vine.string().trim().maxLength(254).nullable(),
		visibility: vine.enum(Visibility),
	})
);

createCollectionValidator.messagesProvider = new SimpleMessagesProvider({
	name: 'Collection name is required',
	'visibility.required': 'Collection visibiliy is required',
});
