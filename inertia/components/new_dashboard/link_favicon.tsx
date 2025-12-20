import { useEffect, useRef, useState } from 'react';

const IMG_LOAD_TIMEOUT = 7_500;

interface LinkFaviconProps {
	url: string;
	size?: number;
}

export function LinkFavicon({ url, size = 32 }: LinkFaviconProps) {
	const imgRef = useRef<HTMLImageElement>(null);
	const [isFailed, setFailed] = useState<boolean>(false);
	const [isLoading, setLoading] = useState<boolean>(true);

	const handleErrorLoading = () => {
		setFailed(true);
		setLoading(false);
	};

	const handleStopLoading = () => {
		setLoading(false);
	};

	useEffect(() => {
		if (imgRef.current?.complete) {
			handleStopLoading();
			return;
		}
		const id = setTimeout(() => handleErrorLoading(), IMG_LOAD_TIMEOUT);
		return () => clearTimeout(id);
	}, [isLoading]);

	return (
		<div className="relative flex-shrink-0">
			{!isFailed ? (
				<img
					src={`/favicon?url=${url}`}
					onError={handleErrorLoading}
					onLoad={handleStopLoading}
					height={size}
					width={size}
					alt="icon"
					ref={imgRef}
					decoding="async"
					className="rounded"
				/>
			) : (
				<div
					className="i-themify-world w-8 h-8 flex-shrink-0"
					style={{ width: `${size}px`, height: `${size}px` }}
				/>
			)}
			{isLoading && (
				<div
					className="absolute inset-0 flex items-center justify-center"
					style={{ height: `${size}px`, width: `${size}px` }}
				>
					<div className="w-3 h-3 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
				</div>
			)}
		</div>
	);
}

