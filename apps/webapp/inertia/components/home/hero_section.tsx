import { Trans } from '@lingui/react/macro';

import { PROJECT_DOCS_URL } from '~/consts/project';
import { HeroDemo } from '~/components/home/hero_demo';
import { HeroAuthActions } from '~/components/home/hero_auth_actions';

export const HeroSection = () => (
	<div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center py-16 sm:py-24">
		<div>
			<p className="font-mono text-xs uppercase tracking-widest text-brand dark:text-brand-dark mb-4">
				mylinks
			</p>
			<h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-tight text-ink dark:text-ink-dark mb-6">
				<Trans>Drop in a link. Get back a bookmark you'll find again.</Trans>
			</h1>
			<p className="text-lg text-ink/70 dark:text-ink-dark/70 mb-8 max-w-lg">
				<Trans>
					MyLinks turns scattered tabs into collections you can search, share
					and export any time. Hosted for you, or run it yourself.
				</Trans>
			</p>
			<HeroAuthActions />
		</div>
		<div className="flex flex-col gap-3">
			<HeroDemo />
			<a
				href={PROJECT_DOCS_URL}
				target="_blank"
				rel="noreferrer"
				className="flex items-center gap-3 rounded-xl border border-rule dark:border-rule-dark bg-paper dark:bg-ink px-4 py-3 shadow-sm hover:border-brand dark:hover:border-brand-dark transition-colors"
			>
				<span className="i-mdi-book-open-variant w-8 h-8 flex-shrink-0 block transform-gpu text-ink dark:text-ink-dark" />
				<div className="min-w-0 flex-1">
					<p className="truncate font-medium text-ink dark:text-ink-dark">
						<Trans>Documentation</Trans>
					</p>
					<p className="truncate font-mono text-xs text-ink/50 dark:text-ink-dark/50">
						{PROJECT_DOCS_URL}
					</p>
				</div>
			</a>
		</div>
	</div>
);
