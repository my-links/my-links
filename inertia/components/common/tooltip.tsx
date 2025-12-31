import React, {
	ReactNode,
	useState,
	useRef,
	useEffect,
	cloneElement,
	isValidElement,
} from 'react';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
	content: ReactNode;
	children: ReactNode;
	position?: TooltipPosition;
	showOnClick?: boolean;
	temporaryContent?: ReactNode;
	temporaryDuration?: number;
	disabled?: boolean;
	onTemporaryShow?: () => void;
}

export function Tooltip({
	content,
	children,
	position = 'top',
	showOnClick = false,
	temporaryContent,
	temporaryDuration = 2000,
	disabled = false,
	onTemporaryShow,
}: TooltipProps) {
	const [isVisible, setIsVisible] = useState(false);
	const [showTemporary, setShowTemporary] = useState(false);
	const tooltipRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLDivElement>(null);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	const showTemporaryContent = () => {
		if (disabled || !temporaryContent) return;
		setShowTemporary(true);
		setIsVisible(true);
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
		timeoutRef.current = setTimeout(() => {
			setIsVisible(false);
			setShowTemporary(false);
		}, temporaryDuration);
		if (onTemporaryShow) {
			onTemporaryShow();
		}
	};

	const handleMouseEnter = () => {
		if (disabled) return;
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
		setIsVisible(true);
	};

	const handleMouseLeave = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
		setIsVisible(false);
		setShowTemporary(false);
	};

	const handleClick = () => {
		if (disabled || !showOnClick) return;
		showTemporaryContent();
	};

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	const positionClasses = {
		top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
		bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
		left: 'right-full top-1/2 -translate-y-1/2 mr-2',
		right: 'left-full top-1/2 -translate-y-1/2 ml-2',
	};

	const arrowClasses = {
		top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 dark:border-t-gray-100 border-l-transparent border-r-transparent border-b-transparent',
		bottom:
			'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 dark:border-b-gray-100 border-l-transparent border-r-transparent border-t-transparent',
		left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 dark:border-l-gray-100 border-t-transparent border-b-transparent border-r-transparent',
		right:
			'right-full top-1/2 -translate-y-1/2 border-r-gray-900 dark:border-r-gray-100 border-t-transparent border-b-transparent border-l-transparent',
	};

	const displayContent =
		showTemporary && temporaryContent ? temporaryContent : content;

	const childWithProps = isValidElement(children)
		? cloneElement(children, {
				onClick: (e: React.MouseEvent) => {
					if (showOnClick && temporaryContent) {
						showTemporaryContent();
					}
					if (children.props.onClick) {
						children.props.onClick(e);
					}
				},
			} as any)
		: children;

	return (
		<div
			ref={triggerRef}
			className="relative inline-block"
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			{childWithProps}
			{isVisible && !disabled && (
				<div
					ref={tooltipRef}
					className={`absolute z-50 px-3 py-1.5 text-sm text-white dark:text-gray-900 bg-gray-900 dark:bg-gray-100 rounded-lg shadow-lg whitespace-nowrap pointer-events-none ${positionClasses[position]}`}
					role="tooltip"
				>
					{displayContent}
					<div
						className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}
					/>
				</div>
			)}
		</div>
	);
}
