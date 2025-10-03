import { HostAPI } from "../../@types/globals";
import { FlagProvider } from "./flag_provider";
import { HostProvider } from "./host_provider";
import { ProjectsProvider } from "./projects_provider";

export const Providers: React.FC<{ host: HostAPI, children: React.ReactNode }> =
    ({ host, children }) => (
        <HostProvider host={host}>
            <ProjectsProvider>
                <FlagProvider>
                    {children}
                </FlagProvider>
            </ProjectsProvider>
        </HostProvider>
    )
