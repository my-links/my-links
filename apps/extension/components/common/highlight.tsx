import { splitIntoHighlightSegments } from '@/lib/search_highlight';

interface HighlightProps {
	text: string;
	searchTerm: string;
}

export function Highlight({ text, searchTerm }: Readonly<HighlightProps>) {
	const segments = splitIntoHighlightSegments(text, searchTerm);

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
