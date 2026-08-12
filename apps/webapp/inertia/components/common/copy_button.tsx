import { ReactNode, useState } from 'react';

const COPIED_INDICATOR_TIMEOUT = 2_000;

interface CopyButtonProps {
	value: string;
	children: (props: {
		copied: boolean;
		copy: () => void | Promise<void>;
	}) => ReactNode;
}

export function CopyButton({ value, children }: Readonly<CopyButtonProps>) {
	const [copied, setCopied] = useState(false);

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			setTimeout(() => setCopied(false), COPIED_INDICATOR_TIMEOUT);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	};

	return <>{children({ copied, copy })}</>;
}
