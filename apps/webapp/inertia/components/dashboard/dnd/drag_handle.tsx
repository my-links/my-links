import clsx from 'clsx';
import type {
	DraggableAttributes,
	DraggableSyntheticListeners,
} from '@dnd-kit/core';

interface DragHandleProps {
	attributes: DraggableAttributes;
	listeners: DraggableSyntheticListeners;
	setActivatorNodeRef: (element: HTMLElement | null) => void;
	label: string;
	className?: string;
}

export function DragHandle({
	attributes,
	listeners,
	setActivatorNodeRef,
	label,
	className,
}: Readonly<DragHandleProps>) {
	return (
		<button
			ref={setActivatorNodeRef}
			type="button"
			aria-label={label}
			className={clsx(
				'opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
				className
			)}
			{...attributes}
			{...listeners}
		>
			<div className="i-mdi-drag w-4 h-4" />
		</button>
	);
}
