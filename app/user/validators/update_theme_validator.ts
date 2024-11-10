import vine from '@vinejs/vine';

export const updateThemeValidator = vine.compile(
	vine.object({
		preferDarkTheme: vine.boolean(),
	})
);
