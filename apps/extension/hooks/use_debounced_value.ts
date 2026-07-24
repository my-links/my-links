import { useEffect, useState } from 'react';

const DEFAULT_DEBOUNCE_MS = 250;

export function useDebouncedValue<TValue>(
	value: TValue,
	delayMs: number = DEFAULT_DEBOUNCE_MS
): TValue {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const timeoutId = setTimeout(() => setDebouncedValue(value), delayMs);
		return () => clearTimeout(timeoutId);
	}, [value, delayMs]);

	return debouncedValue;
}
