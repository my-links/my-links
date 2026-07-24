import { Button } from '@minimalstuff/ui';
import { useEffect, useState } from 'react';

import { bookmarkMirrorStorage } from '@/lib/storage';
import {
	disableBookmarkMirror,
	enableBookmarkMirror,
} from '@/lib/bookmarks/setup';

type MirrorStatus =
	| { kind: 'loading' }
	| { kind: 'off' }
	| { kind: 'working' }
	| { kind: 'on' }
	| { kind: 'error'; message: string };

export function BookmarkMirrorSection() {
	const [status, setStatus] = useState<MirrorStatus>({ kind: 'loading' });

	useEffect(() => {
		void bookmarkMirrorStorage.getValue().then((state) => {
			setStatus({ kind: state.isEnabled ? 'on' : 'off' });
		});
	}, []);

	const handleEnable = async () => {
		setStatus({ kind: 'working' });
		try {
			await enableBookmarkMirror();
			setStatus({ kind: 'on' });
		} catch (error) {
			setStatus({
				kind: 'error',
				message:
					error instanceof Error
						? error.message
						: 'Could not set up bookmark mirroring.',
			});
		}
	};

	const handleDisable = async () => {
		setStatus({ kind: 'working' });
		try {
			await disableBookmarkMirror();
			setStatus({ kind: 'off' });
		} catch (error) {
			setStatus({
				kind: 'error',
				message:
					error instanceof Error
						? error.message
						: 'Could not stop bookmark mirroring.',
			});
		}
	};

	if (status.kind === 'loading') {
		return null;
	}

	const isWorking = status.kind === 'working';
	const isMirroring = status.kind === 'on';

	return (
		<section className="flex flex-col gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
			<h2 className="text-sm font-semibold">Browser bookmarks</h2>
			<p className="text-sm text-gray-600 dark:text-gray-400">
				{isMirroring
					? 'Your collections are mirrored into a MyLinks folder on the bookmarks bar. MyLinks only ever writes inside that folder.'
					: 'Mirror your collections into a MyLinks folder on the bookmarks bar. Whatever is on the bar today is moved into a dated backup folder inside it — nothing is deleted, and turning this off puts it all back.'}
			</p>

			{isMirroring ? (
				<Button
					color="neutral"
					variant="outline"
					loading={isWorking}
					disabled={isWorking}
					onClick={() => void handleDisable()}
				>
					Stop mirroring
				</Button>
			) : (
				<Button
					color="primary"
					loading={isWorking}
					disabled={isWorking}
					onClick={() => void handleEnable()}
				>
					Mirror to bookmarks bar
				</Button>
			)}

			{status.kind === 'error' && (
				<p className="text-sm text-red-700 dark:text-red-400">
					{status.message}
				</p>
			)}
		</section>
	);
}
