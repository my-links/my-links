interface HighlightProps {
	text: string;
	searchTerm: string;
}

export function Highlight({ text, searchTerm }: Readonly<HighlightProps>) {
	if (!searchTerm.trim()) {
		return text;
	}

	const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
	const parts = text.split(regex);

	return (
		<>
			{parts.map((part, index) => {
				const testRegex = new RegExp(`^${escapedSearchTerm}$`, 'i');
				return testRegex.test(part) ? (
					<mark
						key={index}
						className="bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 rounded"
					>
						{part}
					</mark>
				) : (
					<span key={index}>{part}</span>
				);
			})}
		</>
	);
}
