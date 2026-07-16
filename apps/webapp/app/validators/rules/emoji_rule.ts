import vine from '@vinejs/vine';
import emojiRegex from 'emoji-regex';
import type { FieldContext } from '@vinejs/vine/types';

const emojiRegexPattern = emojiRegex();

export const emojiRule = vine.createRule(
	async (value: unknown, _, field: FieldContext) => {
		if (value === null || value === undefined || value === '') {
			return;
		}

		if (typeof value !== 'string') {
			return;
		}

		const matches = value.match(emojiRegexPattern);
		if (!matches || matches.join('') !== value) {
			field.report(
				'The {{ field }} field must be a valid emoji',
				'emoji',
				field
			);
		}
	}
);
