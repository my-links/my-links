import { cn } from '~/lib/cn';

interface LifecycleSectionProps {
	verb: string;
	icon: string;
	title: React.ReactNode;
	description: React.ReactNode;
	isLast?: boolean;
	children?: React.ReactNode;
}

export function LifecycleSection({
	verb,
	icon,
	title,
	description,
	isLast = false,
	children,
}: Readonly<LifecycleSectionProps>) {
	return (
		<div className="flex gap-6 md:gap-10 py-10">
			<div className="flex-shrink-0 w-12 flex flex-col items-center">
				<div className="w-12 h-12 rounded-lg border border-rule dark:border-rule-dark bg-paper dark:bg-ink flex items-center justify-center">
					<span
						className={cn(icon, 'w-6 h-6 text-brand dark:text-brand-dark')}
					/>
				</div>
				{!isLast && (
					<div className="w-px flex-1 bg-rule dark:bg-rule-dark mt-2" />
				)}
			</div>
			<div className="flex-1 min-w-0 pb-2">
				<p className="font-mono text-xs uppercase tracking-widest text-brand dark:text-brand-dark mb-2">
					{verb}
				</p>
				<h3 className="font-display text-2xl sm:text-3xl text-ink dark:text-ink-dark mb-3">
					{title}
				</h3>
				<p className="text-ink/70 dark:text-ink-dark/70 leading-relaxed max-w-xl">
					{description}
				</p>
				{children}
			</div>
		</div>
	);
}
