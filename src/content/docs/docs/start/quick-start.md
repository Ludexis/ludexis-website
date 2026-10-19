---
title: Quick start
description: Run a Ludexis server with Docker Compose and sign in for the first time.
---

Ludexis runs as one Docker Compose stack: the web app, the API, a worker, a scheduler, PostgreSQL, Redis and a small Caddy proxy that serves everything on one port. The images are published for amd64 and arm64.

## Requirements

| | |
| --- | --- |
| Docker | Docker Engine 24 or newer, with the Compose plugin |
| Memory | 2 GB of RAM, 4 GB for large libraries |
| Games | A folder of games the server can read |

The backend containers run unprivileged as uid 1000, so that user needs read access to your games folder. Ludexis never writes to it.

## 1. Download the files

Make a folder for the stack and download the compose file, the example settings and the Caddyfile into it:

```bash
mkdir ludexis && cd ludexis
curl -O https://raw.githubusercontent.com/Ludexis/Ludexis/main/docker-compose.yml
curl -O https://raw.githubusercontent.com/Ludexis/Ludexis/main/.env.example
mkdir deploy && curl -o deploy/Caddyfile https://raw.githubusercontent.com/Ludexis/Ludexis/main/deploy/Caddyfile
cp .env.example .env
```

The Caddyfile must sit at `deploy/Caddyfile` next to `docker-compose.yml`, because the proxy mounts it from there. It sends `/api`, `/media` and `/healthz` to the backend and everything else to the web app.

:::note
The monitoring profile also reads `deploy/prometheus.yml`. Download it the same way if you plan to use [monitoring](/docs/using/monitoring/).
:::

## 2. Edit `.env`

Every container reads `.env`. Set at least these three values:

```env title=".env"
GAMES_PATH=/mnt/games    # your games folder, mounted read-only at /games
TZ=Europe/Berlin         # scheduled tasks run in this time zone
POSTGRES_PASSWORD=change-me
```

`GAMES_PATH` is required: Compose refuses to start without it. Inside the containers the folder appears as `/games`, and that is the path you give Ludexis when you add a library.

Everything else has a working default. [Configuration](/docs/start/configuration/) lists every setting.

## 3. Start the stack

```bash
docker compose up -d
```

The first start pulls the images, creates the database and runs the migrations. The proxy waits until the backend and the web app report healthy, so the page may take a minute to appear.

To check on it:

```bash
docker compose ps
docker compose logs -f backend
```

## 4. Sign in

Open `http://<host>:8420` and sign in as `admin` with the password `admin`. The setup screen then asks for a new password, adds `/games` as the first library, optionally stores IGDB credentials, and starts the first scan. [First sign-in and setup](/docs/start/first-run/) walks through it.

:::caution
The default password is public. Ludexis serves the default account nothing but the setup screen until the password is changed, but change it before you expose the server to anyone.
:::

## Next steps

- [Libraries and scans](/docs/using/libraries/) explains how scans work and how to add more folders.
- [Metadata and Identify](/docs/using/metadata/) covers the metadata sources and fixing a wrong match.
- [Domains, TLS and proxies](/docs/advanced/domains/) covers HTTPS before you open the server to the internet.
- [Edge devices](/docs/edge/overview/) let a laptop or another PC scan the drives attached to it.
