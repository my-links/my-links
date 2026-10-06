import type { ChangeEvent } from 'react';
import { Checkbox } from '@minimalstuff/ui';

import type { UserWithCounters } from '~/components/admin/users/users_table_columns';

type UserSelectCheckboxProps = {
	user: UserWithCounters;
	isSelected: boolean;
	onSelectionChange: (userId: number, isSelected: boolean) => void;
};

export function UserSelectCheckbox({
	user,
	isSelected,
	onSelectionChange,
}: Readonly<UserSelectCheckboxProps>) {
	const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
		onSelectionChange(user.id, event.target.checked);

	return (
		<Checkbox
			checked={isSelected}
			disabled={user.isAdmin}
			onChange={handleChange}
			aria-label={`Select user ${user.fullname}`}
		/>
	);
}
