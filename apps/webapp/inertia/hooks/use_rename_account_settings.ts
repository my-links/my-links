import { usePage } from '@inertiajs/react';

type RenameAccountSettings = {
	displayName: string;
};

export const useRenameAccountSettings = (): RenameAccountSettings =>
	usePage<RenameAccountSettings>().props;
