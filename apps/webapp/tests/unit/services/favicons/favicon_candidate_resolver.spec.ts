import { test } from '@japa/runner';

import {
	parseDocument,
	resolveUrl,
	scoreSizes,
	findManifestHref,
	findMetaRefreshUrl,
	resolveDocumentBaseUrl,
	extractLinkIconCandidates,
	extractMetaImageCandidates,
	extractManifestIconCandidates,
} from '#services/favicons/favicon_candidate_resolver';

test.group('resolveUrl', () => {
	test('should resolve an absolute href, ignoring the base entirely', ({
		assert,
	}) => {
		// The github.com bug: the old buildFaviconUrl concatenated the base in
		// front of an already-absolute href.
		assert.equal(
			resolveUrl('https://github.com/fluidicon.png', 'https://github.com/'),
			'https://github.com/fluidicon.png'
		);
	});

	test('should resolve a protocol-relative href against the base scheme', ({
		assert,
	}) => {
		assert.equal(
			resolveUrl('//cdn.example.com/icon.png', 'https://example.com/'),
			'https://cdn.example.com/icon.png'
		);
	});

	test('should resolve a root-relative href against the origin', ({
		assert,
	}) => {
		assert.equal(
			resolveUrl('/favicon.ico', 'https://example.com/some/page'),
			'https://example.com/favicon.ico'
		);
	});

	test('should resolve a document-relative href against the base path', ({
		assert,
	}) => {
		assert.equal(
			resolveUrl('icons/32.png', 'https://example.com/some/page'),
			'https://example.com/some/icons/32.png'
		);
	});

	test('should return undefined for an unparsable href', ({ assert }) => {
		assert.isUndefined(resolveUrl('not a url', 'not a base either'));
	});
});

test.group('scoreSizes', () => {
	test('should score a declared icon with no sizes attribute above nothing', ({
		assert,
	}) => {
		assert.isAbove(scoreSizes(undefined), 0);
	});

	test('should score a larger declared size higher than a smaller one', ({
		assert,
	}) => {
		assert.isAbove(scoreSizes('192x192'), scoreSizes('16x16'));
	});

	test('should score "any" above every fixed size', ({ assert }) => {
		assert.isAbove(scoreSizes('any'), scoreSizes('512x512'));
	});

	test('should take the largest token when multiple sizes are declared', ({
		assert,
	}) => {
		assert.equal(scoreSizes('16x16 32x32 48x48'), scoreSizes('48x48'));
	});
});

test.group('resolveDocumentBaseUrl', () => {
	test('should use the document URL when there is no <base> tag', ({
		assert,
	}) => {
		const document = parseDocument('<html><head></head></html>');

		assert.equal(
			resolveDocumentBaseUrl(document, 'https://example.com/page'),
			'https://example.com/page'
		);
	});

	test('should resolve relative hrefs against <base href>', ({ assert }) => {
		const document = parseDocument(
			'<html><head><base href="https://assets.example.com/"></head></html>'
		);

		assert.equal(
			resolveDocumentBaseUrl(document, 'https://example.com/page'),
			'https://assets.example.com/'
		);
	});
});

test.group('extractLinkIconCandidates', () => {
	test('should tokenize a multi-value rel attribute', ({ assert }) => {
		const document = parseDocument(
			'<html><head><link rel="shortcut icon" href="/favicon.png"></head></html>'
		);

		const candidates = extractLinkIconCandidates(
			document,
			'https://example.com/'
		);

		assert.deepEqual(
			candidates.map((candidate) => candidate.url),
			['https://example.com/favicon.png']
		);
	});

	test('should collect every candidate, not just the first match', ({
		assert,
	}) => {
		const document = parseDocument(`<html><head>
			<link rel="icon" href="/a.png">
			<link rel="apple-touch-icon" href="/b.png">
		</head></html>`);

		const candidates = extractLinkIconCandidates(
			document,
			'https://example.com/'
		);

		assert.equal(candidates.length, 2);
	});

	test('should order candidates by declared size, largest first', ({
		assert,
	}) => {
		const document = parseDocument(`<html><head>
			<link rel="icon" href="/small.png" sizes="16x16">
			<link rel="icon" href="/large.png" sizes="192x192">
		</head></html>`);

		const candidates = extractLinkIconCandidates(
			document,
			'https://example.com/'
		);

		assert.deepEqual(
			candidates.map((candidate) => candidate.url),
			['https://example.com/large.png', 'https://example.com/small.png']
		);
	});

	test('should resolve an absolute href without concatenating the base', ({
		assert,
	}) => {
		// vercel.com / lemonde.fr bug: buildFaviconUrl produced
		// "https://vercel.com/https://assets.vercel.com/...".
		const document = parseDocument(
			'<html><head><link rel="icon" href="https://assets.vercel.com/icon.png"></head></html>'
		);

		const candidates = extractLinkIconCandidates(
			document,
			'https://vercel.com/'
		);

		assert.deepEqual(
			candidates.map((candidate) => candidate.url),
			['https://assets.vercel.com/icon.png']
		);
	});

	test('should ignore a <link> with no matching rel token', ({ assert }) => {
		const document = parseDocument(
			'<html><head><link rel="stylesheet" href="/site.css"></head></html>'
		);

		assert.deepEqual(
			extractLinkIconCandidates(document, 'https://example.com/'),
			[]
		);
	});
});

test.group('findManifestHref', () => {
	test('should find a declared manifest link', ({ assert }) => {
		const document = parseDocument(
			'<html><head><link rel="manifest" href="/manifest.json"></head></html>'
		);

		assert.equal(findManifestHref(document), '/manifest.json');
	});

	test('should return undefined when there is no manifest link', ({
		assert,
	}) => {
		const document = parseDocument('<html><head></head></html>');

		assert.isUndefined(findManifestHref(document));
	});
});

test.group('extractManifestIconCandidates', () => {
	test('should resolve icon src against the manifest URL, not the document URL', ({
		assert,
	}) => {
		const candidates = extractManifestIconCandidates(
			{ icons: [{ src: 'icons/192.png', sizes: '192x192' }] },
			'https://example.com/static/manifest.json'
		);

		assert.deepEqual(
			candidates.map((candidate) => candidate.url),
			['https://example.com/static/icons/192.png']
		);
	});

	test('should order manifest icons by size, largest first', ({ assert }) => {
		const candidates = extractManifestIconCandidates(
			{
				icons: [
					{ src: 'small.png', sizes: '48x48' },
					{ src: 'large.png', sizes: '512x512' },
				],
			},
			'https://example.com/manifest.json'
		);

		assert.deepEqual(
			candidates.map((candidate) => candidate.url),
			['https://example.com/large.png', 'https://example.com/small.png']
		);
	});

	test('should return no candidates when the manifest declares no icons', ({
		assert,
	}) => {
		assert.deepEqual(
			extractManifestIconCandidates({}, 'https://example.com/manifest.json'),
			[]
		);
	});
});

test.group('extractMetaImageCandidates', () => {
	test('should prefer msapplication-TileImage over og:image', ({ assert }) => {
		const document = parseDocument(`<html><head>
			<meta name="msapplication-TileImage" content="/tile.png">
			<meta property="og:image" content="/social.png">
		</head></html>`);

		const candidates = extractMetaImageCandidates(
			document,
			'https://example.com/'
		);

		assert.deepEqual(
			candidates.map((candidate) => candidate.url),
			['https://example.com/tile.png', 'https://example.com/social.png']
		);
	});

	test('should fall back to og:image alone when there is no tile image', ({
		assert,
	}) => {
		const document = parseDocument(
			'<html><head><meta property="og:image" content="/social.png"></head></html>'
		);

		const candidates = extractMetaImageCandidates(
			document,
			'https://example.com/'
		);

		assert.deepEqual(
			candidates.map((candidate) => candidate.url),
			['https://example.com/social.png']
		);
	});

	test('should return no candidates when neither meta tag is present', ({
		assert,
	}) => {
		const document = parseDocument('<html><head></head></html>');

		assert.deepEqual(
			extractMetaImageCandidates(document, 'https://example.com/'),
			[]
		);
	});
});

test.group('findMetaRefreshUrl', () => {
	test('should find a standard "0;url=..." meta refresh', ({ assert }) => {
		const document = parseDocument(
			'<html><head><meta http-equiv="refresh" content="0;url=/en/"></head></html>'
		);

		assert.equal(findMetaRefreshUrl(document), '/en/');
	});

	test('should handle a space after the delay and quoted url', ({ assert }) => {
		const document = parseDocument(
			`<html><head><meta http-equiv="refresh" content="0; url='/en/'"></head></html>`
		);

		assert.equal(findMetaRefreshUrl(document), '/en/');
	});

	test('should be case-insensitive on http-equiv', ({ assert }) => {
		const document = parseDocument(
			'<html><head><meta http-equiv="Refresh" content="5;url=/landing"></head></html>'
		);

		assert.equal(findMetaRefreshUrl(document), '/landing');
	});

	test('should return undefined when there is no meta refresh', ({
		assert,
	}) => {
		const document = parseDocument('<html><head></head></html>');

		assert.isUndefined(findMetaRefreshUrl(document));
	});

	test('should return undefined for a refresh with no url, just a delay', ({
		assert,
	}) => {
		const document = parseDocument(
			'<html><head><meta http-equiv="refresh" content="30"></head></html>'
		);

		assert.isUndefined(findMetaRefreshUrl(document));
	});
});
