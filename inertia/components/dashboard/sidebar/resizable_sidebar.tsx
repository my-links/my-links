import clsx from 'clsx';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useDashboardLayoutStore } from '~/stores/dashboard_layout_store';

interface ResizableSidebarProps {
	children: ReactNode;
}

export function ResizableSidebar({ children }: ResizableSidebarProps) {
	const { sidebarWidth, setSidebarWidth } = useDashboardLayoutStore();
	const [isResizing, setIsResizing] = useState(false);
	const sidebarRef = useRef<HTMLDivElement>(null);
	const startXRef = useRef<number>(0);
	const startWidthRef = useRef<number>(0);

	const handleMouseDown = (e: React.MouseEvent) => {
		e.preventDefault();
		setIsResizing(true);
		startXRef.current = e.clientX;
		startWidthRef.current = sidebarWidth;
		document.body.style.cursor = 'col-resize';
		document.body.style.userSelect = 'none';
	};

	useEffect(() => {
		if (!isResizing) return;

		const handleMouseMove = (e: MouseEvent) => {
			const diff = e.clientX - startXRef.current;
			const newWidth = startWidthRef.current + diff;
			setSidebarWidth(newWidth);
		};

		const handleMouseUp = () => {
			setIsResizing(false);
			document.body.style.cursor = '';
			document.body.style.userSelect = '';
		};

		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
			document.body.style.cursor = '';
			document.body.style.userSelect = '';
		};
	}, [isResizing, setSidebarWidth]);

	return (
		<div
			ref={sidebarRef}
			className="relative flex-shrink-0 flex flex-col"
			style={{ width: `${sidebarWidth}px` }}
		>
			{children}
			<div
				onMouseDown={handleMouseDown}
				className={clsx(
					'absolute top-0 right-0 w-1 h-full cursor-col-resize',
					'hover:bg-blue-500/50 transition-colors',
					isResizing && 'bg-blue-500'
				)}
				style={{ touchAction: 'none' }}
			/>
		</div>
	);
}
