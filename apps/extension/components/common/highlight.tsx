import { splitIntoHighlightSegments } from '@/lib/search_highlight';

interface HighlightProps {
	text: string;
	ranges: readonly number[];
}

export function Highlight({ text, ranges }: Readonly<HighlightProps>) {
	const segments = splitIntoHighlightSegments(text, ranges);

	return (
		<>
			{segments.map((segment, index) =>
				segment.isMatch ? (
					<mark
						key={`${segment.text}-${index}`}
						className="rounded bg-yellow-200 text-yellow-900 dark:bg-yellow-800 dark:text-yellow-100"
					>
						{segment.text}
					</mark>
				) : (
					segment.text
				)
			)}
		</>
	);
}
