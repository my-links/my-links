import vine, { SimpleMessagesProvider } from '@vinejs/vine';
import { Visibility } from '../enums/visibility.js';

export const createCollectionValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(254),
    description: vine.string().trim().maxLength(254).nullable(),
    visibility: vine.enum(Visibility),
    nextId: vine.string().optional(),
  })
);

export const updateCollectionValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(254),
    description: vine.string().trim().maxLength(254).nullable(),
    visibility: vine.enum(Visibility),
    nextId: vine.string().optional(),

    params: vine.object({
      id: vine.string().trim(),
    }),
  })
);

createCollectionValidator.messagesProvider = new SimpleMessagesProvider({
  name: 'Collection name is required',
  'visibility.required': 'Collection visibiliy is required',
});
