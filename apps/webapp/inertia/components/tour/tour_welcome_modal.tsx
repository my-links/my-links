import { createPortal } from 'react-dom';
import { Button } from '@minimalstuff/ui';
import { Trans } from '@lingui/react/macro';

interface TourWelcomeModalProps {
	onStart: () => void;
	onSkip: () => void;
}

export function TourWelcomeModal({
	onStart,
	onSkip,
}: Readonly<TourWelcomeModalProps>) {
	return createPortal(
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
			<div className="w-full max-w-sm rounded-xl border border-rule dark:border-rule-dark bg-paper dark:bg-paper-dark p-6 shadow-xl">
				<h2 className="font-display text-lg text-ink dark:text-ink-dark">
					<Trans>Take a quick tour?</Trans>
				</h2>
				<p className="mt-2 text-sm text-ink/80 dark:text-ink-dark/80">
					<Trans>
						See where your collections, search and the main actions live. It
						only takes a minute.
					</Trans>
				</p>
				<div className="mt-5 flex items-center justify-end gap-2">
					<Button onClick={onSkip} variant="ghost" size="sm">
						<Trans>Skip</Trans>
					</Button>
					<Button onClick={onStart} color="primary" size="sm">
						<Trans>Start tour</Trans>
					</Button>
				</div>
			</div>
		</div>,
		document.body
	);
}
