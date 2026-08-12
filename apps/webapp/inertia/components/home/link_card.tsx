import { cn } from '~/lib/cn';
import { LinkFavicon } from '~/components/dashboard/links/link_favicon';

interface LinkCardProps {
	url: string;
	title: string;
	icon?: string;
}

export function LinkCard({ url, title, icon }: Readonly<LinkCardProps>) {
	return (
		<a
			href={url}
			target="_blank"
			rel="noreferrer"
			className="flex items-center gap-3 rounded-xl border border-rule dark:border-rule-dark bg-paper dark:bg-ink px-4 py-3 shadow-sm hover:border-brand dark:hover:border-brand-dark transition-colors"
		>
			{icon ? (
				<span
					className={cn(
						icon,
						'w-8 h-8 flex-shrink-0 block transform-gpu text-ink dark:text-ink-dark'
					)}
				/>
			) : (
				<LinkFavicon url={url} size={32} />
			)}
			<div className="min-w-0 flex-1">
				<p className="truncate font-medium text-ink dark:text-ink-dark">
					{title}
				</p>
				<p className="truncate font-mono text-xs text-ink/50 dark:text-ink-dark/50">
					{url}
				</p>
			</div>
		</a>
	);
}
