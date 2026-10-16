import vine from '@vinejs/vine';

import { MAXIMUM_URL_LENGTH } from '#constants/link';

export const linkUrlSchema = vine
	.string()
	.normalizeUrl({ defaultProtocol: 'https', stripWWW: false })
	.url({
		protocols: ['http', 'https'],
		require_protocol: true,
		validate_length: false,
	})
	.maxLength(MAXIMUM_URL_LENGTH)
	.trim();

export const linkUrlValidator = vine.create(
	vine.object({ url: linkUrlSchema })
);
