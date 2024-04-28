import vine, { SimpleMessagesProvider } from '@vinejs/vine';
import { Visibility } from '../enums/visibility.js';

export const collectionValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(254),
    description: vine.string().trim().maxLength(300).optional(),
    visibility: vine.enum(Visibility),
    nextId: vine.string().optional(),
  })
);

collectionValidator.messagesProvider = new SimpleMessagesProvider({
  name: 'Collection name is required',
  'visibility.required': 'Collection visibiliy is required',
});
