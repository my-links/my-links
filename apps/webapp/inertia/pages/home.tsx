import { Trans } from '@lingui/react/macro';

import { HeroSection } from '~/components/home/hero_section';
import { ProductScreenshot } from '~/components/home/product_screenshot';
import { LifecycleSections } from '~/components/home/lifecycle_sections';
import { CallToActionSection } from '~/components/home/call_to_action_section';

function HomePage() {
	return (
		<>
			<HeroSection />

			<div className="pb-16">
				<p className="font-mono text-xs uppercase tracking-widest text-brand dark:text-brand-dark mb-4 text-center">
					<Trans>the app</Trans>
				</p>
				<ProductScreenshot />
			</div>

			<LifecycleSections />

			<CallToActionSection />
		</>
	);
}

export default HomePage;
