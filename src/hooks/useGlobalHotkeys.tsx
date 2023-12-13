import GlobalHotkeysContext from 'contexts/globalHotkeysContext';
import { useContext } from 'react';

export default function useGlobalHotkeys() {
  return useContext(GlobalHotkeysContext);
}
