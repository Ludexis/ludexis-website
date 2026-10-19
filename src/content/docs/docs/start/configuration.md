---
title: Configuration
description: Every setting Ludexis reads from .env, with its default and what it does.
---

Every container in the stack reads `.env` from the folder that holds `docker-compose.yml`. Change a value, then run `docker compose up -d` so the containers are recreated with it.

Most installs only set `GAMES_PATH`, `TZ` and `POSTGRES_PASSWORD`. The settings further down this page are for special setups.

:::note
In the tables, **Default** is the value used when the setting is missing or empty. Where `.env.example` ships a different value, both are given.
:::

## Server

| Setting | Default | Meaning |
| --- | --- | --- |
| `GAMES_PATH` | none, required | Folder on the host that holds your games. It is mounted read-only at `/games` in the backend, worker and scheduler. |
| `LUDEXIS_PORT` | `8420` | Host port the web app is served on (plain HTTP). |
| `LUDEXIS_HTTPS_PORT` | `8443` | Host port for HTTPS. Only used when `LUDEXIS_DOMAIN` is set. |
| `LUDEXIS_DOMAIN` | empty | A domain name that points at this host. When set, Caddy obtains and renews a certificate for it and redirects HTTP to HTTPS. Empty serves plain HTTP. See [Domains, TLS and proxies](/docs/advanced/domains/). |
| `LUDEXIS_VERSION` | `latest` | Image tag for the backend and web app. `latest` follows the newest build; a release such as `1.2` or `1.2.3` pins it. See [Updating and backups](/docs/start/updating/). |
| `TZ` | `UTC` | Time zone of the scheduled tasks. The nightly scan runs at 02:00 in this zone. |
| `LOG_LEVEL` | `INFO` | Level of the log messages Ludexis writes, such as `DEBUG`, `INFO` or `WARNING`. |

## First administrator

These are read once, on a first start with an empty database. Changing them later has no effect on existing accounts.

| Setting | Default | Meaning |
| --- | --- | --- |
| `DEFAULT_ADMIN_USERNAME` | `admin` | Username of the administrator created on first start. |
| `DEFAULT_ADMIN_PASSWORD` | `admin` | Its password, which must be changed at the first sign-in. `python -m scripts.reset_password` also resets accounts to this password. |
| `DEFAULT_ADMIN_EMAIL` | `admin@example.com` | Its email address; the setup screen lets you change it. |

## Database

| Setting | Default | Meaning |
| --- | --- | --- |
| `POSTGRES_USER` | `ludexis` | Database account. The database container creates it and the backend connects with it. |
| `POSTGRES_PASSWORD` | `ludexis` (`.env.example`: `change-me`) | Password of that account. Set your own before the first start; the database is only reachable inside the stack. |
| `POSTGRES_DB` | `ludexis` | Database name. |
| `POSTGRES_HOST` | `db` | Host the backend connects to. |
| `POSTGRES_PORT` | `5432` | Port the backend connects to. |
| `DATABASE_URL` | built from the `POSTGRES_*` values | Full connection URL, for an external PostgreSQL server. Leave it unset to use the values above. |

:::caution
The database container only reads `POSTGRES_USER`, `POSTGRES_PASSWORD` and `POSTGRES_DB` when it creates the database. Changing them afterwards does not change the existing account, and the backend can no longer connect.
:::

## Redis and the job queue

| Setting | Default | Meaning |
| --- | --- | --- |
| `REDIS_URL` | `redis://redis:6379/0` | Redis server. |
| `CELERY_BROKER_URL` | value of `REDIS_URL` | Queue the background jobs are sent through. |
| `CELERY_RESULT_BACKEND` | value of `REDIS_URL` | Where job results are kept. |
| `JOB_MAX_RETRIES` | `5` | How often a failed job is retried. |
| `JOB_RETRY_BACKOFF_MAX` | `300` | Longest wait between retries, in seconds. |

## Metadata

| Setting | Default | Meaning |
| --- | --- | --- |
| `TWITCH_CLIENT_ID` | empty | Client ID of a Twitch developer application, used to sign in to IGDB. |
| `TWITCH_CLIENT_SECRET` | empty | Its client secret. |
| `STEAMGRIDDB_API_KEY` | empty | A SteamGridDB API key, which adds community covers, banners and logos. |
| `PROVIDER_PLUGINS_DIR` | empty | Folder of extra metadata provider modules, loaded at startup. Empty loads none. See [Extra metadata sources](/docs/advanced/providers/). |
| `IGDB_TOKEN_URL` | `https://id.twitch.tv/oauth2/token` | Where IGDB access tokens are requested. Rarely changed. |
| `IGDB_API_URL` | `https://api.igdb.com/v4` | IGDB API address. Rarely changed. |

The IGDB and SteamGridDB credentials can also be entered under **Admin > Settings**. When they are set in `.env`, the environment wins and the fields in the web app are locked.

## Sign-in and security

| Setting | Default | Meaning |
| --- | --- | --- |
| `JWT_SECRET_KEY` | generated | Secret that signs sign-in tokens. Left empty, one is generated on first start and stored in the data volume. If you set it, it must be at least 32 characters, for example from `openssl rand -hex 32`. |
| `JWT_ALGORITHM` | `HS256` | Signing algorithm of the tokens. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `15` | Lifetime of an access token. The web app renews it in the background. |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `30` | Lifetime of a refresh token, which is how long a session lasts without use. |
| `CORS_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000` | Other origins allowed to call the API from a browser, separated by commas or as a JSON list. Only needed when the web app is served from a different address than the API. |

## Storage

| Setting | Default | Meaning |
| --- | --- | --- |
| `ARTWORK_STORAGE_PATH` | `/data/artwork` in the compose stack | Where downloaded and uploaded artwork is stored. |
| `CONFIG_DIR` | `/data/config` in the compose stack | Where the generated JWT secret is kept. |
| `MAX_ARTWORK_SIZE_MB` | `10` | Largest artwork file that can be uploaded. |
| `ALLOWED_ARTWORK_MIME_TYPES` | `["image/jpeg","image/png","image/webp","image/gif","image/avif"]` | Image types accepted for uploads, as a JSON list. |

`docker-compose.yml` sets `ARTWORK_STORAGE_PATH` and `CONFIG_DIR` for the backend, worker and scheduler, so values in `.env` do not apply to them. Both paths live on the `ludexis_data` volume.

## Advanced

| Setting | Default | Meaning |
| --- | --- | --- |
| `API_PREFIX` | `/api` | Path the API is served under. The Caddyfile and the web app expect `/api`, so leave it as it is. |

## Monitoring

Used only by the [monitoring profile](/docs/using/monitoring/).

| Setting | Default | Meaning |
| --- | --- | --- |
| `GRAFANA_PORT` | `3000` | Host port of Grafana. |
| `GRAFANA_ADMIN_PASSWORD` | `admin` | Password of Grafana's `admin` account on its first start. |

## Edge devices

An edge device has its own `.env`, which comes filled in with its install files. Its settings are described in [Edge devices](/docs/edge/overview/#the-device-settings).
