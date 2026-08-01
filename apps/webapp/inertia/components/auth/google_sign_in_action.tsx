import { Trans } from '@lingui/react/macro';
import { Link } from '@adonisjs/inertia/react';

export const GoogleSignInAction = () => (
	<>
		<div className="flex items-center gap-3">
			<span className="h-px flex-1 bg-rule dark:bg-rule-dark" />
			<span className="text-xs uppercase tracking-wide text-ink/50 dark:text-ink-dark/50">
				<Trans>or</Trans>
			</span>
			<span className="h-px flex-1 bg-rule dark:bg-rule-dark" />
		</div>
		<Link
			route="auth"
			className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-rule dark:border-rule-dark text-ink dark:text-ink-dark font-medium hover:border-brand dark:hover:border-brand-dark transition-colors duration-200"
		>
			<i className="i-logos-google-icon h-5 w-5 block" aria-hidden="true" />
			<Trans>Continue with Google</Trans>
		</Link>
	</>
);
