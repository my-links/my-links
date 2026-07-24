import { deleteLink } from '@/lib/api/links';
import { removeLinkFromTree } from '@/lib/collections_tree';
import { useCollectionsMutation } from '@/hooks/use_collections_mutation';

export function useDeleteLink() {
	return useCollectionsMutation<number>({
		mutationFn: deleteLink,
		applyOptimisticUpdate: (collections, linkId) =>
			removeLinkFromTree(collections, linkId),
	});
}
