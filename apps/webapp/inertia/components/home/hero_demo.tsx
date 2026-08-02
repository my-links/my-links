import { useEffect, useState } from 'react';

import { LinkCard } from '~/components/home/link_card';

const DEMO_URL = 'https://github.com/my-links/my-links';
const DEMO_TITLE = 'my-links/my-links';

const TYPING_DURATION_MS = 900;
const RESOLVING_DURATION_MS = 500;

type Phase = 'resolved' | 'typing' | 'resolving';

/**
 * Renders only the finished card on the server and on first paint — SSR and
 * no-JS visitors never see anything else. The rewind-and-replay only happens
 * client-side, once, and only without `prefers-reduced-motion`: the initial
 * client render still matches the server (phase starts at "resolved" either
 * way), so there's nothing to hydrate around.
 */
export function HeroDemo() {
	const [phase, setPhase] = useState<Phase>('resolved');

	useEffect(() => {
		const prefersReducedMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)'
		).matches;
		if (prefersReducedMotion) {
			return;
		}

		setPhase('typing');
		const toResolving = setTimeout(
			() => setPhase('resolving'),
			TYPING_DURATION_MS
		);
		const toResolved = setTimeout(
			() => setPhase('resolved'),
			TYPING_DURATION_MS + RESOLVING_DURATION_MS
		);

		return () => {
			clearTimeout(toResolving);
			clearTimeout(toResolved);
		};
	}, []);

	if (phase === 'resolved') {
		return (
			<div className="hero-demo__card-in">
				<LinkCard url={DEMO_URL} title={DEMO_TITLE} icon="i-mdi-github" />
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center gap-2 rounded-lg border border-rule dark:border-rule-dark bg-paper dark:bg-ink px-4 py-3 font-mono text-sm text-ink dark:text-ink-dark">
				<span className="i-tabler-link w-4 h-4 flex-shrink-0 text-ink/40 dark:text-ink-dark/40" />
				<span className={phase === 'typing' ? 'hero-demo__url' : undefined}>
					{DEMO_URL}
				</span>
			</div>
			<div className="flex items-center justify-center gap-2 h-4">
				{phase === 'resolving' && (
					<span className="i-svg-spinners-3-dots-fade w-4 h-4 text-ink/40 dark:text-ink-dark/40" />
				)}
			</div>
		</div>
	);
}
