import { Input } from '@minimalstuff/ui';
import type { ChangeEvent } from 'react';

interface SearchBarProps {
	value: string;
	onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: Readonly<SearchBarProps>) {
	const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
		onChange(event.target.value);

	return (
		<div className="px-2 pb-1 pt-2">
			<Input
				type="search"
				aria-label="Search MyLinks"
				value={value}
				onChange={handleChange}
				placeholder="Search MyLinks…"
			/>
		</div>
	);
}
