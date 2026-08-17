import vine from '@vinejs/vine';

// Untrusted remote JSON, validated rather than cast — same precedent as importDataValidator.
export const webAppManifestValidator = vine.create(
	vine.object({
		icons: vine
			.array(
				vine.object({
					src: vine.string().trim().minLength(1),
					sizes: vine.string().trim().optional(),
				})
			)
			.optional(),
	})
);
