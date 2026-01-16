import { useEffect, useRef, useState } from 'react';

export type FloatingTab = {
	value: string;
	label: string;
	content: React.ReactNode;
	disabled?: boolean;
	indicator?: {
		content: string;
		color?: string;
		pulse?: boolean;
		disabled?: boolean;
	};
};

interface FloatingTabsProps {
	tabs: FloatingTab[];
	keepMounted?: boolean;
}

export function FloatingTabs({ tabs, keepMounted = false }: FloatingTabsProps) {
	const [activeValue, setActiveValue] = useState<string | null>(tabs[0]?.value);
	const [indicatorStyle, setIndicatorStyle] = useState<{
		left: number;
		width: number;
	} | null>(null);
	const rootRef = useRef<HTMLDivElement>(null);
	const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

	const updateIndicator = () => {
		if (!activeValue || !rootRef.current) {
			setIndicatorStyle(null);
			return;
		}

		const activeButton = buttonRefs.current[activeValue];
		if (!activeButton || !rootRef.current) {
			setIndicatorStyle(null);
			return;
		}

		const rootRect = rootRef.current.getBoundingClientRect();
		const buttonRect = activeButton.getBoundingClientRect();

		setIndicatorStyle({
			left: buttonRect.left - rootRect.left,
			width: buttonRect.width,
		});
	};

	useEffect(() => {
		updateIndicator();
		const handleResize = () => updateIndicator();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, [activeValue]);

	const setButtonRef = (value: string) => (node: HTMLButtonElement | null) => {
		buttonRefs.current[value] = node;
		if (node) {
			updateIndicator();
		}
	};

	const activeTab = tabs.find((tab) => tab.value === activeValue);

	return (
		<div>
			<div
				ref={rootRef}
				className="relative mb-4 flex gap-2"
				style={{ position: 'relative' }}
			>
				{tabs.map((tab) => {
					const isActive = tab.value === activeValue;
					const showIndicator =
						tab.indicator && !tab.indicator.disabled && tab.indicator.content;

					return (
						<div key={tab.value} className="relative">
							{showIndicator && (
								<span
									className={`absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-xs font-medium text-white rounded-full z-10 ${
										tab.indicator?.pulse ? 'animate-pulse' : ''
									}`}
									style={{
										backgroundColor:
											tab.indicator?.color || 'rgb(59, 130, 246)',
									}}
								>
									{tab.indicator?.content}
								</span>
							)}
							<button
								ref={setButtonRef(tab.value)}
								onClick={() => !tab.disabled && setActiveValue(tab.value)}
								disabled={tab.disabled}
								className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors z-[1] ${
									isActive
										? 'text-gray-900 dark:text-gray-100'
										: 'text-gray-600 dark:text-gray-400'
								} ${
									tab.disabled
										? 'opacity-50 cursor-not-allowed'
										: 'hover:text-gray-900 dark:hover:text-gray-100'
								}`}
							>
								{tab.label}
							</button>
						</div>
					);
				})}
				{indicatorStyle && (
					<div
						className="absolute bottom-0 h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200 ease-out z-0"
						style={{
							left: `${indicatorStyle.left}px`,
							width: `${indicatorStyle.width}px`,
						}}
					/>
				)}
			</div>
			<div>
				{(keepMounted ? tabs : [activeTab].filter(Boolean)).map((tab) => {
					if (!tab) return null;
					const isActive = tab.value === activeValue;
					if (!keepMounted && !isActive) return null;

					return (
						<div
							key={tab.value}
							className={keepMounted && !isActive ? 'hidden' : ''}
						>
							<div className="space-y-4">{tab.content}</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
