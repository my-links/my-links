import vine from '@vinejs/vine';

export const updateUserThemeValidator = vine.compile(
  vine.object({
    preferDarkTheme: vine.boolean(),
  })
);
