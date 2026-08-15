import { IconButton, Tooltip } from '@minimalstuff/ui';
import {
	useState,
	type FocusEvent,
	type MouseEvent,
	type ReactNode,
} from 'react';

interface KebabMenuProps {
	label: string;
	children: ReactNode;
}

/**
 * Minimal dismissable dropdown for row-level actions (edit/delete on a
 * collection or link). Closes on blur rather than a document click
 * listener — cheaper and sidesteps the extra teardown a global listener
 * would need across every open sidebar/newtab instance.
 */
export function KebabMenu({ label, children }: Readonly<KebabMenuProps>) {
	const [isOpen, setIsOpen] = useState(false);

	const handleToggle = (event: MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
		setIsOpen((previous) => !previous);
	};

	const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
		if (!event.currentTarget.contains(event.relatedTarget)) {
			setIsOpen(false);
		}
	};

	return (
		<div className="relative flex-shrink-0" onBlur={handleBlur}>
			<Tooltip content={label} position="bottom">
				<IconButton
					icon="i-mdi-dots-vertical"
					aria-label={label}
					size="sm"
					variant="ghost"
					onClick={handleToggle}
				/>
			</Tooltip>
			{isOpen && (
				<div className="absolute right-0 top-full z-10 mt-1 w-36 overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
					{children}
				</div>
			)}
		</div>
	);
}
