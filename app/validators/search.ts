import vine from '@vinejs/vine';

export const searchValidator = vine.compile(
  vine.object({
    searchTerm: vine.string().trim().minLength(1).maxLength(254),
    links: vine.boolean(),
    collections: vine.boolean(),
  })
);
