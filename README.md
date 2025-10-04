# YouTrack Test App
This repository contains code for an internship assignment: create a single-page YouTrack App that shows a project list and a flag you can toggle on/off.
In the repository, you can find the dist.zip file, which is ready to be uploaded to YouTrack.

## Architecture
### Frontend
1. Flag/projects provider - manages flag/projects state and exposes it to other components with useFlag()/useProjects().
2. Flag/projects service - wrapper around host.fetchApp/host.fetchYouTrack.
3. App - Entry point for UI, displays projects and flag toggle.

#### Frontend flow
1. When the app is opened, useProjects() fetches projects via the host.fetchYouTrack('admin/projects', …)
2. Simultaneously, useFlag() loads the stored boolean flag via the host.fetchApp('backend/flag')
3. The user can toggle the flag, and this triggers a POST to backend/flag
4. After mounting, the polling loop repeatedly calls
getFlag() to re-fetch the latest flag value from the backend.
This ensures all connected clients eventually see the same state.

### Backend
YouTrack automatically provisions a backend for each installed app. My code interacts with it via the host.fetchApp() calls.

#### Endpoints

| Method | Path           | Description                                                                 |
| ------ | -------------- | --------------------------------------------------------------------------- |
| `GET`  | `backend/flag` | Returns current flag and version `{ flag: boolean, version: number }`            |
| `POST` | `backend/flag` | Persists the new flag `{ flag: boolean, version: number }` and returns updated value and version |

The backend stores the flag and version inside YouTrack’s internal app storage.


## Conflict resolution: Last-Write-Wins (LWW)
To keep UX simple and predictable when concurrent clients may toggle the flag at nearly the same time, I picked this strategy. 
Since the flag is a single scalar (boolean) with no merge semantics, I believe this option is fine. 

1. **State model:** The flag is stored in App Storage as `{ flag, version }`, where `version` increments on every update.
2. **Read:** Clients fetch `/backend/flag` to get the current flag and version.
3. **Write:** Clients send the new flag with their known version.
4. **Conflict detection:** If the server’s version differs, it returns HTTP 412 and the latest `{ flag, version }`.
5. **Resolution:** The client replaces its local state with the server’s data — the **last write on the server wins**.
6. **Sync:** A 3-second polling loop keeps all clients updated with the newest version.


## Build & run instructions
The repository already contains dist.zip, which is ready to be uploaded to YouTrack. 
However, below you can find instructions to build and run the app if needed.
### Build
```console
npm run build
```
The build output goes to dist/.
### Create ZIP

#### macOS/Linux (or WSL):
```console
cd dist && zip -r ../dist.zip ./* && cd ..
```
#### Windows PowerShell:
```console
Compress-Archive -Path .\dist\* -DestinationPath .\dist.zip
```
### Install into YouTrack 
The proccess is documented in **[Jetbrains' guide](https://www.jetbrains.com/help/youtrack/devportal/apps-quick-start-guide.html?utm_source=chatgpt.com)**

