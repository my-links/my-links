type ImageSignature = {
	type: string;
	matches: (buffer: Buffer) => boolean;
};

const SVG_PREFIX_PATTERN = /^\s*(<\?xml|<svg)/i;
const SVG_SNIFF_WINDOW = 256;

const IMAGE_SIGNATURES: ImageSignature[] = [
	{
		type: 'image/png',
		matches: (buffer) =>
			buffer.length >= 8 &&
			buffer[0] === 0x89 &&
			buffer[1] === 0x50 &&
			buffer[2] === 0x4e &&
			buffer[3] === 0x47,
	},
	{
		type: 'image/jpeg',
		matches: (buffer) =>
			buffer.length >= 3 &&
			buffer[0] === 0xff &&
			buffer[1] === 0xd8 &&
			buffer[2] === 0xff,
	},
	{
		type: 'image/gif',
		matches: (buffer) =>
			buffer.length >= 6 &&
			(buffer.toString('ascii', 0, 6) === 'GIF87a' ||
				buffer.toString('ascii', 0, 6) === 'GIF89a'),
	},
	{
		type: 'image/webp',
		matches: (buffer) =>
			buffer.length >= 12 &&
			buffer.toString('ascii', 0, 4) === 'RIFF' &&
			buffer.toString('ascii', 8, 12) === 'WEBP',
	},
	{
		type: 'image/x-icon',
		matches: (buffer) =>
			buffer.length >= 4 &&
			buffer[0] === 0x00 &&
			buffer[1] === 0x00 &&
			buffer[2] === 0x01 &&
			buffer[3] === 0x00,
	},
	{
		type: 'image/svg+xml',
		matches: (buffer) =>
			SVG_PREFIX_PATTERN.test(
				buffer.toString('utf8', 0, Math.min(buffer.length, SVG_SNIFF_WINDOW))
			),
	},
];

// Content-Type is what the remote server claims; a valid .ico served as
// application/octet-stream would otherwise be rejected. The magic bytes are
// what the file actually is.
export function sniffImageType(buffer: Buffer): string | undefined {
	return IMAGE_SIGNATURES.find((signature) => signature.matches(buffer))?.type;
}
