import clsx, { type ClassValue } from 'clsx';

/**
 * The one way to build a className in this codebase — never a template
 * literal, never bare `clsx()`. Kept as a thin wrapper so a merge strategy
 * (e.g. tailwind-merge) can be added here later without touching call sites.
 */
export function cn(...inputs: ClassValue[]): string {
	return clsx(inputs);
}
