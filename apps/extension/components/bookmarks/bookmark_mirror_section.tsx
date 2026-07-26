import { Button } from '@minimalstuff/ui';
import { useEffect, useState } from 'react';

import { bookmarkMirrorStorage } from '@/lib/storage';
import { stopMirroringAndRemoveBookmarks } from '@/lib/bookmarks/teardown';
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

	const runMirrorAction = async (
		action: () => Promise<void>,
		settledKind: 'on' | 'off',
		fallbackMessage: string
	) => {
		setStatus({ kind: 'working' });
		try {
			await action();
			setStatus({ kind: settledKind });
		} catch (error) {
			setStatus({
				kind: 'error',
				message: error instanceof Error ? error.message : fallbackMessage,
			});
		}
	};

	const handleEnable = () =>
		runMirrorAction(
			enableBookmarkMirror,
			'on',
			'Could not set up bookmark mirroring.'
		);

	const handleDisable = () =>
		runMirrorAction(
			disableBookmarkMirror,
			'off',
			'Could not stop bookmark mirroring.'
		);

	const handleDisableAndRemove = () =>
		runMirrorAction(
			stopMirroringAndRemoveBookmarks,
			'off',
			'Could not remove the bookmarks MyLinks added.'
		);

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
					? 'Your favourites sit on the bookmarks bar, most used first, and your collections are in a Collections folder kept at the front of it. Bookmarks you added yourself are never touched.'
					: 'Put your favourites straight onto the bookmarks bar, ordered by how often you open them, with your collections in a Collections folder alongside them. Nothing already on your bar is moved or deleted, and turning this off simply stops the syncing.'}
			</p>

			{isMirroring ? (
				<>
					<Button
						color="neutral"
						variant="outline"
						loading={isWorking}
						disabled={isWorking}
						onClick={() => void handleDisable()}
					>
						Stop syncing, keep the bookmarks
					</Button>
					<Button
						color="danger"
						variant="outline"
						loading={isWorking}
						disabled={isWorking}
						onClick={() => void handleDisableAndRemove()}
					>
						Stop syncing and remove them
					</Button>
					<p className="text-xs text-gray-500 dark:text-gray-500">
						Removing takes back only what MyLinks put there. Bookmarks you added
						yourself stay, and so does any folder holding one.
					</p>
				</>
			) : (
				<Button
					color="primary"
					loading={isWorking}
					disabled={isWorking}
					onClick={() => void handleEnable()}
				>
					Sync to bookmarks bar
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
