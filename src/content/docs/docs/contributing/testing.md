---
title: Tests and CI
description: The commands that check the backend and frontend, what CI runs on every push and pull request, and the images it publishes.
---

Run the same checks locally that CI runs before you open a pull request.

## Backend

The suite runs against a real PostgreSQL database called `ludexis_ci`. With the dev compose file running, create it once:

```bash
docker compose -f docker-compose.dev.yml exec db createdb -U ludexis ludexis_ci
```

Then, from `backend/` with the virtual environment active:

```bash
pytest -q
```

The tests connect to `postgresql+psycopg://ludexis:ludexis@localhost:5432/ludexis_ci` unless `TEST_DATABASE_URL` says otherwise. At the start of a run they drop and recreate every table from the models and seed the roles and permissions, so never point `TEST_DATABASE_URL` at a database you want to keep. Artwork the tests save goes to a temporary folder, not to your `ARTWORK_STORAGE_PATH`.

Run one file or one test while you work:

```bash
pytest tests/test_scanner.py -q
pytest tests/test_jobs.py -k cancel -q
```

## Frontend

From `frontend/`:

```bash
npm run lint           # ESLint
npx tsc --noEmit       # type check
npm test               # Vitest unit and component tests
npm run build          # production build
```

`npm run test:e2e` runs the Playwright tests against a running app and backend. CI does not run them.

## What CI runs

Each sub-repository has `.github/workflows/ci.yml`. It runs on every pull request, on pushes to `main` and on `v*` tags.

### ludexis-backend

The `test` job runs on Ubuntu with `postgres:16` and `redis:7` service containers:

1. Set up Python 3.12, with pip caching keyed on `requirements*.txt`.
2. `pip install -r requirements-dev.txt`
3. `alembic upgrade head`, against the empty `ludexis_ci` database, which checks that every migration applies.
4. `pytest -v`

The job sets the database, Redis and Celery URLs, a test JWT secret, token lifetimes, the job retry settings, placeholder Twitch credentials and `ARTWORK_STORAGE_PATH` as environment variables.

### ludexis-frontend

The `test` job sets `NEXT_TELEMETRY_DISABLED=1` and runs:

1. Set up Node.js 20, the same major version as the image, with npm caching.
2. `npm ci`
3. `npm run lint`
4. `npx tsc --noEmit`
5. `npm test`
6. `npm run build`, with `NEXT_PUBLIC_API_URL=/api` and `NEXT_PUBLIC_MEDIA_URL=/media`, the settings the image is built with.

### Ludexis

The main repository has no test workflow. Its `release.yml` runs only on version tags; see [Releases](/docs/contributing/releases/).

## Published images

In both sub-repositories, a `publish` job runs after `test` passes, on pushes only, never on pull requests. It sets up QEMU and Buildx, signs in to `ghcr.io` with the workflow's token, and builds and pushes one multi-platform image for `linux/amd64` and `linux/arm64`, so the same tag runs on a PC server or a Raspberry Pi.

| Image | Built from |
| --- | --- |
| `ghcr.io/ludexis/ludexis-backend` | `backend/Dockerfile` (`python:3.12-slim`, runs as an unprivileged user) |
| `ghcr.io/ludexis/ludexis-frontend` | `frontend/Dockerfile` (`node:20-alpine`) |

| Event | Tags pushed |
| --- | --- |
| Push to `main` | `:main` and `:latest` |
| Tag `v1.2.3` | `:1.2.3` and `:1.2` |

The tags come from `docker/metadata-action`. Build layers are cached in the GitHub Actions cache. The frontend's build stages run on the CI machine's own architecture, and only its runtime stage is built per platform.

A third job, `release`, runs after `publish` on version tags and creates the GitHub release of that sub-repository. See [Releases](/docs/contributing/releases/).
