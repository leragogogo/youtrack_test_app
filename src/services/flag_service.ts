import { HostAPI } from "../../@types/globals";

// --- Service to fetch and update flag value ---
export type FlagJSON = {
    flag: boolean;
    version: number;
}

export async function getFlag(host: HostAPI): Promise<FlagJSON> {
    const data = await host.fetchApp('backend/flag', {});
    return data as FlagJSON;
}

export async function setFlag(
    host: HostAPI, newFlag: boolean, version: number
): Promise<FlagJSON> {
    const data = await host.fetchApp('backend/flag',
        { method: "POST", body: { flag: newFlag, version: version } });
    return data as FlagJSON;
}