---
title: Command-line tools
description: Reset a password, check the services and read logs from the server's command line.
---

Ludexis is run and maintained with Docker Compose. Run these commands from the folder that holds `docker-compose.yml`.

## Resetting a password

When nobody can sign in, reset an account on the server:

```bash
docker compose exec backend python -m scripts.reset_password <username>
```

It prints `Password of '<username>' reset to the default; it must be changed at the next sign-in.` and:

- sets the password to `DEFAULT_ADMIN_PASSWORD`, which is `admin` unless you changed it;
- reactivates the account if it was deactivated;
- ends every session of the account;
- makes the account choose a new password at its next sign-in.

An unknown username stops it with `No user named '<username>'`. When an administrator can still sign in, **Reset password** under **Admin > Users** does the same from the web app; see [Users, roles and access](/docs/using/users/).

## The `ludexis` command

The backend image starts every service through one command, `ludexis`, which `docker-compose.yml` calls with a role:

| Command | Runs |
| --- | --- |
| `ludexis server` | Applies database migrations, then starts the API on port 8000 |
| `ludexis worker` | The worker that runs background jobs |
| `ludexis beat` | The scheduler, which starts due scheduled tasks every five minutes |
| `ludexis edge` | An [edge device](/docs/edge/overview/) |
| `ludexis health <role>` | The health check of `server`, `worker`, `beat` or `edge`; exits with an error when it fails |

The health checks are what `docker compose ps` reports. To run one by hand:

```bash
docker compose exec backend ludexis health server
docker compose exec worker ludexis health worker
```

## Logs

Each service logs to Docker:

```bash
docker compose logs -f backend          # API requests, migrations, startup errors
docker compose logs -f worker           # scans, metadata and artwork jobs
docker compose logs -f beat             # scheduled tasks being started
docker compose logs --tail 200 proxy    # the Caddy proxy and certificates
```

`LOG_LEVEL` in `.env` changes how much Ludexis writes; see [Configuration](/docs/start/configuration/).

## Other commands

| Task | Command |
| --- | --- |
| Update to new images | `docker compose pull && docker compose up -d` |
| Back up the database | `docker compose exec -T db pg_dump -U ludexis -Fc ludexis > ludexis-db.dump` |
| Start with monitoring | `docker compose --profile monitoring up -d` |
| Control an edge device | `ludexis-edge start`, `restart`, `stop`, `status`, `logs`, `update` |

[Updating and backups](/docs/start/updating/), [Monitoring](/docs/using/monitoring/) and [The ludexis-edge command](/docs/edge/commands/) describe them in full.
