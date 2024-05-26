import { Visibility } from '#enums/visibility';
import vine, { SimpleMessagesProvider } from '@vinejs/vine';

const params = vine.object({
  id: vine.number(),
});

export const createCollectionValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(254),
    description: vine.string().trim().maxLength(254).nullable(),
    visibility: vine.enum(Visibility),
    nextId: vine.number().optional(),
  })
);

export const updateCollectionValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(254),
    description: vine.string().trim().maxLength(254).nullable(),
    visibility: vine.enum(Visibility),
    nextId: vine.number().optional(),

    params,
  })
);

export const deleteCollectionValidator = vine.compile(
  vine.object({
    params,
  })
);

createCollectionValidator.messagesProvider = new SimpleMessagesProvider({
  name: 'Collection name is required',
  'visibility.required': 'Collection visibiliy is required',
});
