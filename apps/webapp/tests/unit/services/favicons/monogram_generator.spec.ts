import { test } from '@japa/runner';

import { generateMonogram } from '#services/favicons/monogram_generator';

function svgOf(origin: string): string {
	return generateMonogram(origin).toString('utf8');
}

test.group('generateMonogram', () => {
	test('should be deterministic for the same origin', ({ assert }) => {
		assert.equal(svgOf('https://example.com'), svgOf('https://example.com'));
	});

	test('should use the first letter of the hostname, uppercased', ({
		assert,
	}) => {
		assert.include(svgOf('https://example.com'), '>E</text>');
	});

	test('should strip a leading www. before taking the initial', ({
		assert,
	}) => {
		assert.include(svgOf('https://www.example.com'), '>E</text>');
	});

	test('should pick different fill colors for different hostnames', ({
		assert,
	}) => {
		const colorOf = (svg: string) => svg.match(/fill="(#[0-9a-f]+)"/)?.[1];

		assert.notEqual(
			colorOf(svgOf('https://alpha.example')),
			colorOf(svgOf('https://zulu.example'))
		);
	});

	test('should use the same color for two paths on the same hostname', ({
		assert,
	}) => {
		const colorOf = (svg: string) => svg.match(/fill="(#[0-9a-f]+)"/)?.[1];

		assert.equal(
			colorOf(svgOf('https://example.com/a')),
			colorOf(svgOf('https://example.com/b'))
		);
	});

	test('should escape an initial that would otherwise break out of the SVG', ({
		assert,
	}) => {
		// An unparsable origin falls back to using the raw string as the
		// "hostname", so its first character becomes the initial verbatim.
		const svg = svgOf('<script>alert(1)</script>');

		assert.include(svg, '>&lt;</text>');
		assert.notInclude(svg, '<script>');
	});

	test('should fall back to "?" when there is no usable initial', ({
		assert,
	}) => {
		assert.include(svgOf(''), '>?</text>');
	});

	test('should produce valid, well-formed SVG', ({ assert }) => {
		const svg = svgOf('https://example.com');

		assert.isTrue(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"'));
		assert.isTrue(svg.endsWith('</svg>'));
	});
});
