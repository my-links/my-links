export function getVariantClass(variant: string) {
	switch (variant) {
		case 'primary':
			return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
		case 'secondary':
			return 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300';
		case 'success':
			return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
		case 'danger':
			return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
		case 'warning':
			return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
		case 'info':
			return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
		default:
			return 'bg-blue-100 dark:bg-gray-900 text-blue-800 dark:text-gray-200';
	}
}
