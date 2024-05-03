import { useContext } from 'react';
import { ActiveCollectionContext } from '~/contexts/active_collection_context';

const useActiveCollection = () => useContext(ActiveCollectionContext);
export default useActiveCollection;
