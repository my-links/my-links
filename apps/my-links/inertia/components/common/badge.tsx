import { getVariantClass } from '~/lib/color';

interface BadgeProps {
	children: React.ReactNode;
	variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
	size?: 'xs' | 'sm' | 'md' | 'lg' | string;
}

export const Badge = ({
	children,
	variant = 'primary',
	size = 'sm',
}: BadgeProps) => (
	<span
		className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-${size} ${getVariantClass(variant)}`}
	>
		{children}
	</span>
);
