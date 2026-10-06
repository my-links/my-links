import { Trans } from '@lingui/react/macro';

import { CallToActionAuthActions } from '~/components/home/call_to_action_auth_actions';

export const CallToActionSection = () => (
	<div className="my-16 rounded-2xl border border-rule dark:border-rule-dark px-8 py-16 text-center">
		<h2 className="font-display text-3xl sm:text-4xl text-ink dark:text-ink-dark mb-4">
			<Trans>Your links, organized</Trans>
		</h2>
		<p className="text-ink/70 dark:text-ink-dark/70 mb-8 max-w-xl mx-auto">
			<Trans>
				Free to start, open-source to inspect, yours to run anywhere.
			</Trans>
		</p>
		<CallToActionAuthActions />
	</div>
);
