import { ReactNode } from 'react';

interface FormFieldProps {
	label: ReactNode;
	htmlFor: string;
	error?: string | string[];
	children: ReactNode;
	required?: boolean;
}

export function FormField({
	label,
	htmlFor,
	error,
	children,
	required,
}: FormFieldProps) {
	const errorMessage = error ? (Array.isArray(error) ? error[0] : error) : null;

	return (
		<div>
			<label
				htmlFor={htmlFor}
				className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
			>
				{label}
				{required && <span className="text-red-500 ml-1">*</span>}
			</label>
			{children}
			{errorMessage && (
				<p className="mt-1 text-sm text-red-600 dark:text-red-400">
					{errorMessage}
				</p>
			)}
		</div>
	);
}
