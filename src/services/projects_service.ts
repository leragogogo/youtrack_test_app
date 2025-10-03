import { HostAPI } from "../../@types/globals";
// --- Service to fetch projects ---

// Project interface describes the shape of a project object
export interface Project {
    id: string;
    shortName?: string;
    name?: string;
}

export async function fetchProjects(host: HostAPI) {
    const data = await host.fetchYouTrack('admin/projects',
        { query: { fields: "id,shortName,name" } });

    return data as Project[];
}