import { Trans } from '@lingui/react/macro';

import { PROJECT_DOCS_URL } from '~/consts/project';
import { LifecycleSection } from '~/components/home/lifecycle_section';
import { BrowserBarCallout } from '~/components/home/browser_bar_callout';

export const LifecycleSections = () => (
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
);
