import React, { useContext, useReducer, createContext, useEffect, useRef } from 'react';

import { useHost } from './host_provider';
import { getFlag, setFlag } from '../services/flag_service';

type State = {
    flagLoading: boolean;
    flagError: string | null;
    flag: boolean | null;
};

// Reducer acitions
type Action = { type: "LOAD_START" } |
{ type: "LOAD_SUCCESS"; payload: boolean } |
{ type: "LOAD_ERROR"; payload: string } |
{ type: "SET_FLAG"; payload: boolean };

const initial: State = { flagLoading: true, flagError: null, flag: null };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "LOAD_START": return initial;
        case "LOAD_SUCCESS": return {
            flagLoading: false, flagError: null, flag: action.payload
        };
        case "LOAD_ERROR": return {
            flagLoading: false, flagError: action.payload, flag: null
        };
        case "SET_FLAG": return {
            flagLoading: false, flagError: null, flag: action.payload
        };
        default: return state;
    }
}

// Context type: state + toggle function
type Ctx = State & {
    toggle: (newFlag: boolean) => Promise<void>;
};

const FlagContext = createContext<Ctx | undefined>(undefined);

export const FlagProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initial);
    const host = useHost();

    // Keep current value of flag in a ref to compare during polling
    const flagRef = useRef<boolean | null>(state.flag);

    // Keep flag ref syncronized wtih state.flag
    useEffect(() => {
        flagRef.current = state.flag;
    }, [state.flag]);

    useEffect(() => {
        // Load flag on mount
        (async () => {
            dispatch({ type: 'LOAD_START' });
            try {
                const data = await getFlag(host)
                dispatch({ type: 'LOAD_SUCCESS', payload: data });
            } catch {
                dispatch({ type: "LOAD_ERROR", payload: "failed to load flag" })
            }
        })();

        // Short polling
        const id = window.setInterval(async () => {
            const latest = await getFlag(host);
            // Update only if current and latest flags differ
            if (latest != flagRef.current) {
                dispatch({ type: 'LOAD_SUCCESS', payload: latest });
            }
        }, 3000);

        return () => {
            if (id) window.clearInterval(id);
        };
    }, []);

    const toggle = async (newFlag: boolean) => {
        try {
            const updated = await setFlag(host, newFlag);
            dispatch({ type: 'SET_FLAG', payload: updated });
        } catch {
            dispatch({ type: "LOAD_ERROR", payload: "failed to update flag" });
        }
    };

    return <FlagContext.Provider value={{ ...state, toggle }}>
        {children}
    </FlagContext.Provider>
}

export function useFlag(): Ctx {
    const ctx = useContext(FlagContext);
    if (!ctx) throw new Error("useFlag must be used inside FlagProvider");
    return ctx;
}
