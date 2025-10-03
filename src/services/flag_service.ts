import { HostAPI } from "../../@types/globals";

// --- Service to fetch and update flag value ---

export async function getFlag(host: HostAPI): Promise<boolean> {
    const data = await host.fetchApp('backend/flag', {});
    return (data as { flag: boolean }).flag;
}

export async function setFlag(host: HostAPI, newFlag: boolean) {
    const data = await host.fetchApp('backend/flag',
        { method: "POST", body: { flag: newFlag } });
    return (data as { flag: boolean }).flag;
}