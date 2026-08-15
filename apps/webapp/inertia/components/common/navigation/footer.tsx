import { ThemeToggle } from '@minimalstuff/ui';

import { MadeBy } from '~/components/common/navigation/made_by';
import { IconLink } from '~/components/common/navigation/icon_link';
import { LocaleSwitcher } from '~/components/common/locale_switcher';
import { useFooterLinks } from '~/components/common/navigation/footer_links';

export function Footer() {
	const footerLinks = useFooterLinks();

	return (
		<footer className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-sm">
			<div className="py-4 px-4 sm:px-6 text-gray-600 dark:text-gray-400 text-sm">
				<div className="flex flex-col md:flex-row items-center gap-4 md:justify-between">
					<div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
						<MadeBy className="whitespace-nowrap" />
						{footerLinks.map((link) => (
							<IconLink
								key={link.href}
								href={link.href}
								icon={link.icon}
								external={!link.internal}
								className="whitespace-nowrap py-1.5"
							>
								{link.label}
							</IconLink>
						))}
					</div>
					<div className="flex items-center gap-2 justify-center md:justify-end shrink-0">
						<LocaleSwitcher />
						<ThemeToggle />
					</div>
				</div>
			</div>
		</footer>
	);
}
