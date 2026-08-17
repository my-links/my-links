import vine from '@vinejs/vine';

// manifest.json is untrusted JSON fetched from a remote origin; validate its
// shape instead of casting it, same precedent as importDataValidator.
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
