import { ReactNode, useState } from 'react';

interface CopyButtonProps {
	value: string;
	children: (props: { copied: boolean; copy: () => void }) => ReactNode;
}

export function CopyButton({ value, children }: CopyButtonProps) {
	const [copied, setCopied] = useState(false);

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	};

	return <>{children({ copied, copy })}</>;
}
