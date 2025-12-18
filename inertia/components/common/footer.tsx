import { LocaleSwitcher } from '~/components/common/locale_switcher';
import { FOOTER_LINKS } from '~/components/common/navigation/footer_links';
import { IconLink } from '~/components/common/navigation/icon_link';
import { MadeBy } from '~/components/common/navigation/made_by';
import { ThemeToggle } from '~/components/common/theme_toggle';

export const Footer = () => (
	<footer className="hidden md:block bg-white/80 dark:bg-gray-800/80 backdrop-blur-md max-w-[1920px] rounded-lg shadow-sm">
		<div className="py-4 px-4 sm:px-6 text-gray-600 dark:text-gray-400 text-sm">
			<div className="flex flex-col md:flex-row items-center gap-4 md:justify-between">
				<div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 flex-wrap justify-center md:justify-start w-full md:w-auto">
					<div className="flex items-center gap-3 flex-wrap justify-center">
						<MadeBy className="whitespace-nowrap" />
						{FOOTER_LINKS.slice(0, 2).map((link) => (
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
					<div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
						{FOOTER_LINKS.slice(2).map((link) => (
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
				</div>
				<div className="flex items-center gap-2 justify-center md:justify-end shrink-0">
					<LocaleSwitcher />
					<ThemeToggle />
				</div>
			</div>
		</div>
	</footer>
);
