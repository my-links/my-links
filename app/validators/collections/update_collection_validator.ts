import { Visibility } from '#enums/collections/visibility';
import { params } from '#validators/params_object';
import { emojiRule } from '#validators/rules/emoji_rule';
import vine from '@vinejs/vine';

export const updateCollectionValidator = vine.create(
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

		params,
	})
);
