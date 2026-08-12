export const VISIBILITY = {
	PUBLIC: 'PUBLIC',
	PRIVATE: 'PRIVATE',
} as const;

export type Visibility = (typeof VISIBILITY)[keyof typeof VISIBILITY];
