import React, { useContext, createContext } from 'react'
import { HostAPI } from '../../@types/globals'

const HostContext = createContext<HostAPI | undefined>(undefined);

export const HostProvider: React.FC<{ host: HostAPI, children: React.ReactNode }> =
    ({ host, children }) => {
        return <HostContext.Provider value={host}>
            {children}
        </HostContext.Provider>
    }

export function useHost(): HostAPI {
    const ctx = useContext(HostContext);
    if (!ctx) throw new Error("useHost must be used inside HostProvider");
    return ctx;
}