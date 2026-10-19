---
title: Updating and backups
description: Pull new images, pin a release, and back up the database and the data volume.
---

## Updating

From the folder that holds `docker-compose.yml`:

```bash
docker compose pull && docker compose up -d
```

Compose recreates the containers whose image changed. Database migrations run automatically every time the backend starts, before it accepts requests, so there is no separate upgrade step.

:::tip
Make a [backup](/docs/start/updating/#backups) before updating across releases. Migrations change the database in place.
:::

### Pinning a version

`LUDEXIS_VERSION` in `.env` picks the image tag of the backend and the web app:

| Value | What you get |
| --- | --- |
| `latest` | The newest build. This is the default. |
| `1.2` | The newest `1.2.x` release. |
| `1.2.3` | Exactly that release. |

```env title=".env"
LUDEXIS_VERSION=1.2
```

After changing it, run `docker compose pull && docker compose up -d`.

### Edge devices

Keep every [edge device](/docs/edge/overview/) on the server's release. Set the same `LUDEXIS_VERSION` in the device's own `.env`, then run `ludexis-edge update` on it. **Admin > Edge** flags a device that runs another release than the server.

## Backups

Two things hold your data:

| What | Where | Contents |
| --- | --- | --- |
| The database | the `db` service, volume `db_data` | Games, metadata, libraries, users, settings and job history |
| The data volume | `ludexis_data`, mounted at `/data` | Downloaded and uploaded artwork, and the generated JWT secret |

Ludexis never modifies your game files, so they need no backup from it. The `caddy_data` volume holds HTTPS certificates; Caddy requests new ones if it is lost.

### Making a backup

Run these from the folder that holds `docker-compose.yml`, with the stack running:

```bash
docker compose exec -T db pg_dump -U ludexis -Fc ludexis > ludexis-db.dump
docker compose run --rm --no-deps -v "$PWD:/backup" --entrypoint tar backend czf /backup/ludexis-data.tgz -C /data .
```

The first command writes the database to `ludexis-db.dump`. The second starts a throwaway backend container and packs the contents of the data volume into `ludexis-data.tgz`.

:::note
The commands use the default database account and name. If you changed `POSTGRES_USER` or `POSTGRES_DB`, use your values after `-U` and at the end of the `pg_dump` command.
:::

### Restoring

Restore into a fresh stack, before the backend has started:

```bash
docker compose up -d db
docker compose exec -T db pg_restore -U ludexis -d ludexis --clean --if-exists < ludexis-db.dump
docker compose run --rm --no-deps -v "$PWD:/backup" --entrypoint tar backend xzf /backup/ludexis-data.tgz -C /data
docker compose up -d
```

The last command starts the rest of the stack. If the backup came from an older release, the backend migrates the database as it starts.
