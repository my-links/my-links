import { useContext } from 'react';
import GlobalHotkeysContext from '~/contexts/global_hotkeys_context';

const useGlobalHotkeys = () => useContext(GlobalHotkeysContext);
export default useGlobalHotkeys;
