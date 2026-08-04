import { closestCenter } from '@dnd-kit/core';
import type { CollisionDetection } from '@dnd-kit/core';

import { isCollectionDragData } from './drag_data';

/**
 * Restricts collision candidates to the same sidebar section when the
 * dragged item is a collection — dropping into another section would be an
 * implicit visibility change, which the server rejects anyway.
 */
export const dashboardCollisionDetection: CollisionDetection = (args) => {
	const activeData = args.active.data.current;

	if (isCollectionDragData(activeData)) {
		const sameSectionContainers = args.droppableContainers.filter(
			(container) => {
				const containerData = container.data.current;
				return (
					isCollectionDragData(containerData) &&
					containerData.section === activeData.section
				);
			}
		);

		return closestCenter({
			...args,
			droppableContainers: sameSectionContainers,
		});
	}

	return closestCenter(args);
};
