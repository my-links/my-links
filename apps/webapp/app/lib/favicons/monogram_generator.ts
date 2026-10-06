// Medium-saturation, mid-lightness hues: readable white text, visually distinct from each other.
const MONOGRAM_COLORS = [
	'#e05d5d',
	'#e0825d',
	'#d9a441',
	'#8fae3f',
	'#3fae6e',
	'#3fa8ae',
	'#4a8fd6',
	'#6b6bd6',
	'#a15bd6',
	'#d65ba1',
];

const DEFAULT_SIZE = 64;

export function generateMonogram(
	origin: string,
	size: number = DEFAULT_SIZE
): Buffer {
	const hostname = hostnameOf(origin);
	const initial = escapeXml(initialOf(hostname));
	const color = colorFor(hostname);
	const center = size / 2;

	const svg =
		`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
		`<rect width="${size}" height="${size}" rx="${size * 0.2}" fill="${color}"/>` +
		`<text x="${center}" y="${center}" dy="0.35em" text-anchor="middle" ` +
		`font-family="system-ui, sans-serif" font-size="${size * 0.5}" font-weight="600" fill="#ffffff">` +
		`${initial}</text></svg>`;

	return Buffer.from(svg, 'utf8');
}

function hostnameOf(origin: string): string {
	try {
		return new URL(origin).hostname;
	} catch {
		return origin;
	}
}

function initialOf(hostname: string): string {
	const bare = hostname.replace(/^www\./, '');
	return (bare[0] ?? '?').toUpperCase();
}

function colorFor(hostname: string): string {
	return MONOGRAM_COLORS[hashOf(hostname) % MONOGRAM_COLORS.length];
}

function hashOf(value: string): number {
	let hash = 0;
	for (let index = 0; index < value.length; index += 1) {
		hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
	}
	return hash;
}

// The initial is domain-controlled; escaped before insertion so a forged hostname can't inject markup into a response we serve.
function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}
