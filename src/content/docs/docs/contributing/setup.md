---
title: Repositories and setup
description: Clone the Ludexis repositories with their submodules and run the backend and frontend on your machine.
---

Ludexis is split into three repositories in the [Ludexis organization](https://github.com/Ludexis). Open issues and pull requests where the change lives:

| Change | Repository | Checked out at |
| --- | --- | --- |
| API, scanner, metadata, jobs, database, edge devices | [ludexis-backend](https://github.com/Ludexis/ludexis-backend) | `backend/` |
| Web app, pages, components | [ludexis-frontend](https://github.com/Ludexis/ludexis-frontend) | `frontend/` |
| Docker Compose, deployment, documentation, release notes | [Ludexis](https://github.com/Ludexis/Ludexis) | the root |

The main repository includes the other two as Git submodules, listed in `.gitmodules`. Each submodule is a full repository with its own history, branches and CI. The main repository only records which commit of each it uses.

## Requirements

- Git
- Docker, for PostgreSQL and Redis
- Python 3.12, for the backend
- Node.js 20 or later, for the frontend

## Clone

Clone everything at once:

```bash
git clone --recurse-submodules https://github.com/Ludexis/Ludexis.git
cd Ludexis
```

If you cloned without `--recurse-submodules`, fetch the submodules afterwards:

```bash
git submodule update --init
```

To work on only the backend or only the frontend, you can also clone that repository on its own.

:::note
A commit inside `backend/` or `frontend/` belongs to that repository. Commit and open the pull request there. The main repository's pointer to it is moved separately, usually by a Dependabot pull request. See [Commits and pull requests](/docs/contributing/commits/).
:::

## Start PostgreSQL and Redis

`docker-compose.dev.yml` runs only the two services the backend needs, published on loopback:

```bash
docker compose -f docker-compose.dev.yml up -d
```

| Service | Image | Port | Credentials |
| --- | --- | --- | --- |
| `db` | `postgres:16` | `5432` on `127.0.0.1` and `::1` | user `ludexis`, password `ludexis`, database `ludexis` |
| `redis` | `redis:7` | `6379` on `127.0.0.1` and `::1` | none |

The database is kept in the `db_data` volume of the `ludexis-dev` project.

## Run the backend

From `backend/`:

```bash
python -m venv .venv
source .venv/bin/activate            # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt
cp .env.example .env
alembic upgrade head
uvicorn main:app --reload            # http://localhost:8000, API docs at /docs
```

Background jobs need a worker, and scheduled tasks need beat. Start each in its own terminal, with the virtual environment active:

```bash
celery -A app.tasks.celery_app worker --loglevel=info   # add --pool=solo on Windows
celery -A app.tasks.celery_app beat --loglevel=info
```

On first start the backend creates an `admin` / `admin` account, which must choose a new password at its first sign-in.

### backend/.env.example

The example file is set up for this layout: backend on the host, PostgreSQL and Redis from the dev compose file.

| Variable | Example value | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql+psycopg://ludexis:ludexis@localhost:5432/ludexis` | The database |
| `REDIS_URL`, `CELERY_BROKER_URL`, `CELERY_RESULT_BACKEND` | `redis://localhost:6379/0` | Redis for the job queue and results |
| `JWT_SECRET_KEY` | empty | Token signing secret. Left empty, one is created once in `CONFIG_DIR`. If set, at least 32 characters. |
| `CONFIG_DIR` | `./config` | Where the created secret is kept |
| `ACCESS_TOKEN_EXPIRE_MINUTES`, `REFRESH_TOKEN_EXPIRE_DAYS` | `30`, `60` | Session lifetimes |
| `JOB_MAX_RETRIES`, `JOB_RETRY_BACKOFF_MAX` | `5`, `300` | Retry policy for background jobs |
| `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET` | empty | IGDB credentials |
| `STEAMGRIDDB_API_KEY` | empty | Optional SteamGridDB artwork |
| `PROVIDER_PLUGINS_DIR` | empty | Folder of extra metadata provider modules |
| `ARTWORK_STORAGE_PATH` | `./artwork` | Where artwork is saved |
| `CORS_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000` | Web app origins allowed to call the API |
| `DEFAULT_ADMIN_USERNAME`, `DEFAULT_ADMIN_PASSWORD` | `admin`, `admin` | The account created when the database has none |

Without IGDB credentials, IGDB is skipped and matching uses the other sources. See [Configuration](/docs/start/configuration/) for the full list of server settings.

## Run the frontend

From `frontend/`:

```bash
cp .env.example .env.local
npm ci
npm run dev                          # http://localhost:3000
```

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api` | Base URL of the backend API |
| `NEXT_PUBLIC_MEDIA_URL` | `http://localhost:8000/media` | Base URL of artwork served by the backend |
| `NEXT_PUBLIC_DEBUG` | `0` | `1` logs every API request in the browser console |

`NEXT_PUBLIC_*` values are built into the bundle. Restart the dev server after changing them.

Open `http://localhost:3000` and sign in with the backend's account.

## Run an edge device from source

The edge device is part of the backend. With the backend's virtual environment active, it needs only the server address and a device token from **Admin → Edge**:

```bash
LUDEXIS_SERVER_URL=http://localhost:8000 LUDEXIS_EDGE_TOKEN=ldx_... python -m app.edge
```

It reads Linux mounts by default; `EDGE_OS=windows` switches it to the Windows drive mapping used inside its container. See [Edge scans](/docs/architecture/edge-scan/).

## Run the whole stack from your checkout

The production compose file pulls images from GHCR. To build them from your checkout instead, create `.env` from the root `.env.example` and add `--build`:

```bash
cp .env.example .env        # set GAMES_PATH
docker compose up -d --build
```

The stack is then on `http://localhost:8420`.
