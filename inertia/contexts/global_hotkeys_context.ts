import { createContext } from 'react';

type GlobalHotkeysContext = {
	globalHotkeysEnabled: boolean;
	setGlobalHotkeysEnabled: (value: boolean) => void;
};

const iGlobalHotkeysContextState = {
	globalHotkeysEnabled: true,
	setGlobalHotkeysEnabled: (_: boolean) => {},
};

const GlobalHotkeysContext = createContext<GlobalHotkeysContext>(
	iGlobalHotkeysContextState
);

export default GlobalHotkeysContext;
