import { THEMES } from '#constants/user/theme';
import vine from '@vinejs/vine';

export const updateThemeValidator = vine.compile(
	vine.object({
		theme: vine.enum(THEMES),
	})
);
