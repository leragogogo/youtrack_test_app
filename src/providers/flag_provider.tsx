import React, { useContext, useReducer, createContext, useEffect, useRef } from 'react';
import { useHost } from './host_provider';
import { getFlag, setFlag, FlagJSON } from '../services/flag_service';


// Type describing the data stored in flag provider's state
type State = {
    flagLoading: boolean;
    flagError: string | null;
    flag: boolean | null;
    version: number | null;
};

// Reducer acitions
type Action = { type: "LOAD_START" } |
{ type: "LOAD_SUCCESS"; payload: FlagJSON } |
{ type: "LOAD_ERROR"; payload: string } |
{ type: "SET_FLAG"; payload: FlagJSON } |
{ type: "SET_FLAG_CONFLICT"; payload: { message: string, current: FlagJSON } };

const initial: State = { flagLoading: true, flagError: null, flag: null, version: null, };

// Reducer function to handle state transitions
function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "LOAD_START": return initial;
        case "LOAD_SUCCESS": return {
            flagLoading: false,
            flagError: null,
            flag: action.payload.flag,
            version: action.payload.version
        };
        case "LOAD_ERROR": return {
            flagLoading: false,
            flagError: action.payload,
            flag: null,
            version: null,
        };
        case "SET_FLAG": return {
            flagLoading: false,
            flagError: null,
            flag: action.payload.flag,
            version: action.payload.version,
        };
        case "SET_FLAG_CONFLICT": return {
            flagLoading: false,
            flagError: action.payload.message,
            flag: action.payload.current.flag,
            version: action.payload.current.version,
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

    //Keep current version in a ref to compare during polling
    const versionRef = useRef<number | null>(state.version);

    // Keep version ref syncronized wtih state.flag
    useEffect(() => {
        versionRef.current = state.version;
    }, [state.version]);

    useEffect(() => {
        // Load flag on mount
        (async () => {
            dispatch({ type: 'LOAD_START' });
            try {
                const data = await getFlag(host)
                dispatch({ type: 'LOAD_SUCCESS', payload: data });
            } catch (e: any) {
                const data = e?.response?.data;
                dispatch({
                    type: "LOAD_ERROR",
                    payload: data?.message ?? "failed to load flag"
                })
            }
        })();

        // Short polling
        const id = window.setInterval(async () => {
            try {
                const latest = await getFlag(host);
                // Update only if current and latest version differ
                if (latest.version !== versionRef.current) {
                    dispatch({ type: 'LOAD_SUCCESS', payload: latest });
                }
            } catch {
                // Ignore errors during polling
            }
        }, 3000);

        return () => {
            if (id) window.clearInterval(id);
        };
    }, []);

    const toggle = async (newFlag: boolean) => {
        try {
            const next = await setFlag(host, newFlag, state.version ?? 0);
            dispatch({ type: 'SET_FLAG', payload: next });
        } catch (e: any) {
            const status = e?.response?.status;
            const data = e?.response?.data;
            // Handle version conflict (HTTP 412)
            if (status == 412 && data?.current) {
                dispatch({
                    type: "SET_FLAG_CONFLICT",
                    payload: {
                        current: data.current,
                        message: data.message ??
                            'The flag was updated by someone else'
                    }
                })
            }
            else {
                // Handle any other failure
                dispatch({
                    type: "LOAD_ERROR",
                    payload: data?.message ?? "failed to load flag"
                });
            }
        }
    };

    return <FlagContext.Provider value={{ ...state, toggle }}>
        {children}
    </FlagContext.Provider>
}

// Custom hook to access flag state in other components
// Throws an error if used outside of <FlagProvider>.
export function useFlag(): Ctx {
    const ctx = useContext(FlagContext);
    if (!ctx) throw new Error("useFlag must be used inside FlagProvider");
    return ctx;
}
