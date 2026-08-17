import { parse, type HTMLElement } from 'node-html-parser';

export type FaviconCandidate = {
	url: string;
	score: number;
};

export type WebAppManifest = {
	icons?: Array<{ src: string; sizes?: string }>;
};

const ICON_REL_TOKENS = new Set([
	'icon',
	'apple-touch-icon',
	'apple-touch-icon-precomposed',
	'apple-touch-startup-image',
	'mask-icon',
	'fluid-icon',
]);

const DECLARED_ICON_BASE_SCORE = 1;
const ANY_SIZE_SCORE = Number.MAX_SAFE_INTEGER;
const TILE_IMAGE_SCORE = 2;
const OG_IMAGE_SCORE = 1;

export function parseDocument(html: string): HTMLElement {
	return parse(html);
}

// `<base href>` overrides the document URL as the resolution root for every
// relative href on the page, and is silently ignored by a naive `new URL(href, documentUrl)`.
export function resolveDocumentBaseUrl(
	document: HTMLElement,
	documentUrl: string
): string {
	const baseHref = document
		.getElementsByTagName('base')[0]
		?.getAttribute('href');
	if (!baseHref) {
		return documentUrl;
	}

	return resolveUrl(baseHref, documentUrl) ?? documentUrl;
}

export function extractLinkIconCandidates(
	document: HTMLElement,
	baseUrl: string
): FaviconCandidate[] {
	const candidates: FaviconCandidate[] = [];

	for (const link of document.getElementsByTagName('link')) {
		if (!hasRelToken(link, ICON_REL_TOKENS)) {
			continue;
		}

		const href = link.getAttribute('href');
		if (!href) {
			continue;
		}

		const resolvedUrl = resolveUrl(href, baseUrl);
		if (!resolvedUrl) {
			continue;
		}

		candidates.push({
			url: resolvedUrl,
			score: scoreSizes(link.getAttribute('sizes')),
		});
	}

	return sortByScoreDescending(candidates);
}

export function extractMetaImageCandidates(
	document: HTMLElement,
	baseUrl: string
): FaviconCandidate[] {
	const candidates: FaviconCandidate[] = [];

	const tileImage = findMetaContentByName(document, 'msapplication-TileImage');
	const resolvedTileImage = tileImage && resolveUrl(tileImage, baseUrl);
	if (resolvedTileImage) {
		candidates.push({ url: resolvedTileImage, score: TILE_IMAGE_SCORE });
	}

	const ogImage = findMetaContentByProperty(document, 'og:image');
	const resolvedOgImage = ogImage && resolveUrl(ogImage, baseUrl);
	if (resolvedOgImage) {
		candidates.push({ url: resolvedOgImage, score: OG_IMAGE_SCORE });
	}

	return candidates;
}

export function findManifestHref(document: HTMLElement): string | undefined {
	for (const link of document.getElementsByTagName('link')) {
		if (hasRelToken(link, new Set(['manifest']))) {
			return link.getAttribute('href') ?? undefined;
		}
	}

	return undefined;
}

export function extractManifestIconCandidates(
	manifest: WebAppManifest,
	manifestUrl: string
): FaviconCandidate[] {
	const candidates = (manifest.icons ?? []).flatMap((icon) => {
		const resolvedUrl = resolveUrl(icon.src, manifestUrl);
		return resolvedUrl
			? [{ url: resolvedUrl, score: scoreSizes(icon.sizes) }]
			: [];
	});

	return sortByScoreDescending(candidates);
}

export function scoreSizes(sizesAttribute: string | null | undefined): number {
	if (!sizesAttribute) {
		return DECLARED_ICON_BASE_SCORE;
	}

	const tokens = sizesAttribute.trim().toLowerCase().split(/\s+/);
	if (tokens.includes('any')) {
		return ANY_SIZE_SCORE;
	}

	let largestDimension = 0;
	for (const token of tokens) {
		const match = token.match(/^(\d+)x(\d+)$/);
		if (match) {
			largestDimension = Math.max(largestDimension, Number(match[1]));
		}
	}

	return largestDimension || DECLARED_ICON_BASE_SCORE;
}

export function resolveUrl(href: string, base: string): string | undefined {
	try {
		return new URL(href, base).toString();
	} catch {
		return undefined;
	}
}

function hasRelToken(link: HTMLElement, tokens: Set<string>): boolean {
	const relTokens = (link.getAttribute('rel') ?? '').toLowerCase().split(/\s+/);
	return relTokens.some((token) => tokens.has(token));
}

function findMetaContentByName(
	document: HTMLElement,
	name: string
): string | undefined {
	for (const meta of document.getElementsByTagName('meta')) {
		if (meta.getAttribute('name')?.toLowerCase() === name.toLowerCase()) {
			return meta.getAttribute('content') ?? undefined;
		}
	}

	return undefined;
}

function findMetaContentByProperty(
	document: HTMLElement,
	property: string
): string | undefined {
	for (const meta of document.getElementsByTagName('meta')) {
		if (
			meta.getAttribute('property')?.toLowerCase() === property.toLowerCase()
		) {
			return meta.getAttribute('content') ?? undefined;
		}
	}

	return undefined;
}

function sortByScoreDescending(
	candidates: FaviconCandidate[]
): FaviconCandidate[] {
	return [...candidates].sort((first, second) => second.score - first.score);
}
