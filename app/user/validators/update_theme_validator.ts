import { THEMES } from '#user/constants/theme';
import vine from '@vinejs/vine';

export const updateThemeValidator = vine.compile(
	vine.object({
		theme: vine.enum(THEMES),
	})
);
