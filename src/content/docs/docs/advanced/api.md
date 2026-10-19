---
title: API and integrations
description: Sign in to the REST API, refresh tokens, and call common endpoints from curl, JavaScript and Python.
---

Everything the web app does goes through a REST API under `/api`, which scripts and other tools can use too. Requests and responses are JSON unless noted.

Through the bundled proxy, the API is at the same address as the web app:

```text
http://<host>:8420/api
```

or `https://ludexis.example.com/api` with a domain. The examples below use `http://localhost:8420`.

:::note
The interactive API reference is served by the backend itself at `/docs`. The proxy sends that path to the web app, so it is reachable on a development setup at `http://localhost:8000/docs`, not through port 8420.
:::

## Signing in

`POST /api/auth/login` with a username and password returns two tokens:

```json
{
  "access_token": "<jwt>",
  "refresh_token": "<jwt>",
  "token_type": "bearer",
  "expires_in": 900,
  "refresh_expires_in": 2592000
}
```

| Token | Lifetime (default) | Use |
| --- | --- | --- |
| Access token | 15 minutes (`ACCESS_TOKEN_EXPIRE_MINUTES`) | Send it with every request as `Authorization: Bearer <access_token>`. |
| Refresh token | 30 days (`REFRESH_TOKEN_EXPIRE_DAYS`) | Exchange it for a new pair at `POST /api/auth/refresh`. Each refresh token works once; the response carries a new one. |

`POST /api/auth/logout` with the refresh token ends that session. `POST /api/auth/token` accepts the same credentials as an OAuth2 password form, for tools that expect one.

Things to know:

- Tokens are only accepted in the `Authorization` header, never as URL parameters.
- Five failed sign-ins for one username from one address within 15 minutes return `429 Too Many Requests` with a `Retry-After` header.
- An account that still has to change its default password gets `403` for everything except `/api/auth/me`, `/api/auth/change-password` and `/api/auth/logout-all`.
- Requests a role does not allow return `403 Permission denied`. See [Users, roles and access](/docs/using/users/#permissions).

The web app itself signs in with httpOnly cookies instead of the header. Requests that authenticate with those cookies and change data must also send an `X-Requested-With` header. Scripts using the `Authorization` header do not need it.

## Common endpoints

| Method and path | Permission | Purpose |
| --- | --- | --- |
| `GET /api/auth/me` | signed in | The current user |
| `GET /api/search/?q=...` | signed in | Search and filter games: `genre`, `tag`, `developer`, `publisher`, `franchise`, `collection`, `metadata_status`, `verification_status`, `favorite`, `completed`, `group_versions`, `sort`, `offset`, `limit` |
| `GET /api/archive-entries/?offset=0&limit=100` | signed in | List games |
| `GET /api/archive-entries/{id}` | signed in | One game |
| `GET /api/archive-entries/{id}/versions` | signed in | Every version of a game |
| `GET /api/archive-entries/duplicates` | signed in | Groups of files with the same hash |
| `GET /api/libraries/` | signed in | Libraries |
| `POST /api/scan/incremental` | Run scans | Scan for changes; add `?library_id=` for one library |
| `POST /api/scan/full` | Run scans | Full scan; add `?library_id=` for one library |
| `POST /api/jobs/start` | Run scans | Start a job, with `{"job_type": "..."}` |
| `GET /api/jobs/` | signed in | Job history; filter with `job_type`, `status`, `offset`, `limit` |
| `GET /api/jobs/{id}` | signed in | One job |
| `POST /api/jobs/{id}/cancel` | Run scans | Cancel a job |
| `GET /api/metadata/search?q=...&provider=all` | signed in | Search the metadata sources, all or one by name |
| `GET /api/metadata/details/{provider}/{id}` | signed in | One record from a source, such as `IGDB` |
| `GET /api/artwork/missing` | signed in | Games with missing artwork |
| `POST /api/artwork/auto-download` | Edit metadata | Queue a job that downloads missing artwork |
| `GET /api/health/db`, `GET /api/health/redis` | none | Health checks |

Job types for `/api/jobs/start` are `INCREMENTAL_SCAN`, `LIBRARY_SCAN`, `METADATA_REFRESH`, `ARTWORK_REFRESH`, `DUPLICATE_DETECTION` and `INTEGRITY_VERIFICATION`. Job statuses are `PENDING`, `RUNNING`, `SUCCESS`, `FAILED` and `CANCELED`.

Source names in `/api/metadata/details` are case-sensitive: `VNDB`, `IGDB`, `Steam`.

## curl

```bash
BASE=http://localhost:8420/api

# Sign in and keep the access token
TOKEN=$(curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "<username>", "password": "<password>"}' | jq -r .access_token)

# Who am I?
curl -s "$BASE/auth/me" -H "Authorization: Bearer $TOKEN"

# The first 50 games
curl -s "$BASE/archive-entries/?offset=0&limit=50" -H "Authorization: Bearer $TOKEN"

# Start a scan for changes
curl -s -X POST "$BASE/jobs/start" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"job_type": "INCREMENTAL_SCAN"}'

# Check on a job
curl -s "$BASE/jobs/<job_id>" -H "Authorization: Bearer $TOKEN"

# Upload a cover
curl -s -X POST "$BASE/artwork/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "archive_entry_id=<game_id>" \
  -F "artwork_type=cover" \
  -F "file=@cover.jpg"
```

The first command uses `jq` to pick the token out of the response. On Windows PowerShell, set `$TOKEN = "<access_token>"` by hand instead.

## JavaScript

This works in browsers and in Node.js 18 or newer, which have `fetch` built in.

```javascript title="ludexis.mjs"
const BASE_URL = "http://localhost:8420/api";

const login = await fetch(`${BASE_URL}/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: "<username>", password: "<password>" }),
});
if (!login.ok) throw new Error(`Sign-in failed: ${login.status}`);
let { access_token: accessToken, refresh_token: refreshToken } = await login.json();

async function api(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error(`${path}: ${response.status}`);
  return response.status === 204 ? null : response.json();
}

// Search games, one card per game
const games = await api("/search/?q=adventure&group_versions=true&limit=20");
console.log(games.map((game) => game.title));

// Start a scan for changes
const job = await api("/jobs/start", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ job_type: "INCREMENTAL_SCAN" }),
});
console.log(job.id, job.status);

// Refresh the tokens when the access token expires
const refreshed = await fetch(`${BASE_URL}/auth/refresh`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ refresh_token: refreshToken }),
}).then((response) => response.json());
accessToken = refreshed.access_token;
refreshToken = refreshed.refresh_token;
```

## Python

These examples use the `requests` library (`pip install requests`).

```python title="ludexis.py"
import time

import requests

BASE_URL = "http://localhost:8420/api"

response = requests.post(f"{BASE_URL}/auth/login", json={"username": "<username>", "password": "<password>"})
response.raise_for_status()
tokens = response.json()

session = requests.Session()
session.headers["Authorization"] = f"Bearer {tokens['access_token']}"

# Games without a metadata match
unmatched = session.get(f"{BASE_URL}/search/", params={"metadata_status": "UNMATCHED", "limit": 50})
unmatched.raise_for_status()
for game in unmatched.json():
    print(game["title"])

# Start a full scan and wait for it
job = session.post(f"{BASE_URL}/jobs/start", json={"job_type": "LIBRARY_SCAN"})
job.raise_for_status()
job_id = job.json()["id"]

while True:
    status = session.get(f"{BASE_URL}/jobs/{job_id}").json()
    print(status["status"], status["progress"])
    if status["status"] in ("SUCCESS", "FAILED", "CANCELED"):
        break
    time.sleep(5)


def refresh(refresh_token: str) -> dict:
    """Exchange the refresh token for a new pair; the old one stops working."""
    response = requests.post(f"{BASE_URL}/auth/refresh", json={"refresh_token": refresh_token})
    response.raise_for_status()
    return response.json()
```

A long-running script should call `refresh()` when a request returns `401`, and keep the new refresh token it gets back.
