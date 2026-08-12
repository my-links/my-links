import { splitIntoHighlightSegments } from '~/lib/search_highlight';

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
						className="bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 rounded"
					>
						{segment.text}
					</mark>
				) : (
					<span key={index}>{segment.text}</span>
				)
			)}
		</>
	);
}
