import { Center, Loader } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import { TfiWorld } from 'react-icons/tfi';
import styles from './link_favicon.module.css';

const IMG_LOAD_TIMEOUT = 7_500;

interface LinkFaviconProps {
	url: string;
	size?: number;
}

export default function LinkFavicon({ url, size = 32 }: LinkFaviconProps) {
	const imgRef = useRef<HTMLImageElement>(null);

	const [isFailed, setFailed] = useState<boolean>(false);
	const [isLoading, setLoading] = useState<boolean>(true);

	const setFallbackFavicon = () => setFailed(true);
	const handleStopLoading = () => setLoading(false);

	const handleErrorLoading = () => {
		setFallbackFavicon();
		handleStopLoading();
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
		<div className={styles.favicon}>
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
				/>
			) : (
				<TfiWorld size={size} />
			)}
			{isLoading && (
				<Center
					className={styles.faviconLoader}
					style={{ height: `${size}px`, width: `${size}px` }}
				>
					<Loader size="xs" />
				</Center>
			)}
		</div>
	);
}
