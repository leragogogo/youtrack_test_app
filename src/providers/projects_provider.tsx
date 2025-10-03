import React, { useContext, useReducer, createContext, useEffect } from 'react'
import { fetchProjects, type Project } from '../services/projects_service'
import { useHost } from './host_provider';


type State = {
    projectsLoading: boolean;
    projectError: string | null;
    projects: Project[] | null;
};

// Reducer acitions
type Action = { type: "LOAD_START" } |
{ type: "LOAD_SUCCESS"; payload: Project[] } |
{ type: "LOAD_ERROR"; payload: string };

const initial: State = { projectsLoading: true, projectError: null, projects: null };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "LOAD_START": return initial;
        case "LOAD_SUCCESS": return { 
            projectsLoading: false, projectError: null, projects: action.payload 
        };
        case "LOAD_ERROR": return { 
            projectsLoading: false, projectError: action.payload, projects: null 
        };
        default: return state;
    }
};

const ProjectsContext = createContext<State | undefined>(undefined);


export const ProjectsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initial);
    const host = useHost();

    useEffect(() => {
        // Load projects on mount
        (async () => {
            dispatch({ type: 'LOAD_START' });
            try {
                const data = await fetchProjects(host);
                dispatch({ type: "LOAD_SUCCESS", payload: data });
            } catch {
                dispatch({ type: "LOAD_ERROR", payload: "failed to load projects" });
            }
        })();
    }, []);

    return <ProjectsContext.Provider value={state}>
        {children}
    </ProjectsContext.Provider>
}

export function useProjects(): State {
    const ctx = useContext(ProjectsContext);
    if (!ctx) throw new Error("useProjects must be used inside ProjectsProvider");
    return ctx;
}