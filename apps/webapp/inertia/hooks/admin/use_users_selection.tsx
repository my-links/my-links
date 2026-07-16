import { Data } from '@generated/data';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type UserWithCounters = Data.User.Variants['withCounters'];

export function useUsersSelection(
	users: UserWithCounters[],
	sortedData: UserWithCounters[]
) {
	const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(
		() => new Set()
	);

	const deletableUserIds = useMemo(
		() => new Set(users.filter((u) => !u.isAdmin).map((u) => u.id)),
		[users]
	);

	const visibleDeletableUserIds = useMemo(
		() => sortedData.filter((u) => !u.isAdmin).map((u) => u.id),
		[sortedData]
	);

	useEffect(() => {
		setSelectedUserIds((prev) => {
			if (prev.size === 0) return prev;
			const next = new Set<number>();
			prev.forEach((id) => {
				if (deletableUserIds.has(id)) next.add(id);
			});
			return next;
		});
	}, [deletableUserIds]);

	const allVisibleSelected = useMemo(() => {
		if (visibleDeletableUserIds.length === 0) return false;
		return visibleDeletableUserIds.every((id) => selectedUserIds.has(id));
	}, [selectedUserIds, visibleDeletableUserIds]);

	const someVisibleSelected = useMemo(() => {
		if (visibleDeletableUserIds.length === 0) return false;
		return visibleDeletableUserIds.some((id) => selectedUserIds.has(id));
	}, [selectedUserIds, visibleDeletableUserIds]);

	const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const checkbox = selectAllCheckboxRef.current;
		if (!checkbox) return;
		checkbox.indeterminate = someVisibleSelected && !allVisibleSelected;
	}, [someVisibleSelected, allVisibleSelected]);

	const setUserSelected = useCallback((userId: number, selected: boolean) => {
		setSelectedUserIds((prev) => {
			const next = new Set(prev);
			if (selected) next.add(userId);
			else next.delete(userId);
			return next;
		});
	}, []);

	const setAllVisibleSelected = useCallback(
		(selected: boolean) => {
			setSelectedUserIds((prev) => {
				const next = new Set(prev);
				for (const id of visibleDeletableUserIds) {
					if (selected) next.add(id);
					else next.delete(id);
				}
				return next;
			});
		},
		[visibleDeletableUserIds]
	);

	const clearSelection = useCallback(() => setSelectedUserIds(new Set()), []);

	return {
		selectedUserIds,
		selectedCount: selectedUserIds.size,
		allVisibleSelected,
		someVisibleSelected,
		selectAllCheckboxRef,
		visibleDeletableCount: visibleDeletableUserIds.length,
		setUserSelected,
		setAllVisibleSelected,
		clearSelection,
	};
}
