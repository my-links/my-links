import { useContext } from 'react';
import CollectionsContext from '~/contexts/collections_context';

const useCollections = () => useContext(CollectionsContext);
export default useCollections;
