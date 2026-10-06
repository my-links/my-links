import { cn } from '~/lib/cn';

type UserCountBadgeProps = {
	icon: string;
	count: number;
};

export const UserCountBadge = ({
	icon,
	count,
}: Readonly<UserCountBadgeProps>) => (
	<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 font-medium">
		<i className={cn(icon, 'w-4 h-4')} />
		{count}
	</span>
);
