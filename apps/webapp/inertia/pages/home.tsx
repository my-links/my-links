import { Trans } from '@lingui/react/macro';

import { PROJECT_DOCS_URL } from '~/consts/project';
import { HeroDemo } from '~/components/home/hero_demo';
import { HeroAuthActions } from '~/components/home/hero_auth_actions';
import { LifecycleSection } from '~/components/home/lifecycle_section';
import { ProductScreenshot } from '~/components/home/product_screenshot';
import { BrowserBarCallout } from '~/components/home/browser_bar_callout';
import { CallToActionAuthActions } from '~/components/home/call_to_action_auth_actions';

function HomePage() {
	return (
		<>
			<div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center py-16 sm:py-24">
				<div>
					<p className="font-mono text-xs uppercase tracking-widest text-brand dark:text-brand-dark mb-4">
						mylinks
					</p>
					<h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-tight text-ink dark:text-ink-dark mb-6">
						<Trans>
							Drop in a link. Get back a bookmark you'll find again.
						</Trans>
					</h1>
					<p className="text-lg text-ink/70 dark:text-ink-dark/70 mb-8 max-w-lg">
						<Trans>
							MyLinks turns scattered tabs into collections you can search,
							share and export any time. Hosted for you, or run it yourself.
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

			<div className="pb-16">
				<p className="font-mono text-xs uppercase tracking-widest text-brand dark:text-brand-dark mb-4 text-center">
					<Trans>the app</Trans>
				</p>
				<ProductScreenshot />
			</div>

			<div className="border-t border-rule dark:border-rule-dark divide-y divide-rule dark:divide-rule-dark">
				<LifecycleSection
					verb="capture"
					icon="i-tabler-bookmark-plus"
					title={<Trans>Save it before the tab closes</Trans>}
					description={
						<Trans>
							Add a link from the app or straight from your browser with the
							extension. One click, and it's kept.
						</Trans>
					}
				>
					<BrowserBarCallout />
				</LifecycleSection>
				<LifecycleSection
					verb="organize"
					icon="i-tabler-folder"
					title={<Trans>Sort it into a collection, not a folder</Trans>}
					description={
						<Trans>
							Group links by project or topic, keep some private and make others
							public. Your call, per collection.
						</Trans>
					}
				/>
				<LifecycleSection
					verb="find"
					icon="i-tabler-search"
					title={<Trans>Find it in a search, not a scroll</Trans>}
					description={
						<Trans>
							Jump straight to a link by name or URL instead of hunting through
							years of folders.
						</Trans>
					}
				/>
				<LifecycleSection
					verb="take with you"
					icon="i-tabler-download"
					title={<Trans>Export everything, any time</Trans>}
					description={
						<Trans>
							Your links download as plain JSON whenever you want. Nothing kept
							hostage.
						</Trans>
					}
				/>
				<LifecycleSection
					verb="share"
					icon="i-tabler-share"
					title={<Trans>Share a collection with one link</Trans>}
					description={
						<Trans>
							Send a single URL and anyone can browse a public collection. No
							account required on their end.
						</Trans>
					}
				/>
				<LifecycleSection
					verb="own it"
					icon="i-tabler-server-2"
					isLast
					title={<Trans>Run it yourself</Trans>}
					description={
						<Trans>
							MyLinks is open-source. Host it on your own server with Docker and
							keep every link on hardware you control.
						</Trans>
					}
				>
					<a
						href={PROJECT_DOCS_URL}
						className="inline-flex items-center gap-2 mt-4 font-medium text-brand dark:text-brand-dark hover:opacity-80 transition-opacity"
					>
						<Trans>Self-host it</Trans>
						<span className="i-tabler-arrow-right w-4 h-4" />
					</a>
				</LifecycleSection>
			</div>

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
		</>
	);
}

export default HomePage;
