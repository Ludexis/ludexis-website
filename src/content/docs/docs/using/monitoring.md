---
title: Monitoring
description: Health checks, the built-in status card, and the optional Prometheus, Grafana and Node Exporter profile.
---

## Built-in status

**Admin > Overview** has a **Server** card that shows whether the API, the database and Redis are healthy, how many workers are online with their active and queued tasks, and how many scans have succeeded or failed. An **Edge locations** card lists the [edge devices](/docs/edge/overview/) and whether each is checking in.

The same checks are available over HTTP:

| Path | Answers |
| --- | --- |
| `/healthz` | `{"status": "ok"}` while the backend runs |
| `/api/health/db` | `{"database": "healthy"}`, or status 503 when the database is unreachable |
| `/api/health/redis` | `{"redis": "healthy"}`, or status 503 when Redis is unreachable |

Error details are written to the backend log, not returned. Each container also has a Docker health check, so `docker compose ps` shows which one is unhealthy.

## The monitoring profile

The compose file includes an optional profile with Prometheus, Node Exporter and Grafana. It needs `deploy/prometheus.yml` next to the compose file:

```bash
curl -o deploy/prometheus.yml https://raw.githubusercontent.com/Ludexis/Ludexis/main/deploy/prometheus.yml
docker compose --profile monitoring up -d
```

| Service | Role | Reachable at |
| --- | --- | --- |
| Prometheus | Scrapes the backend's metrics and Node Exporter every 15 seconds | Inside the stack only, at `http://prometheus:9090` |
| Node Exporter | Reports system figures such as CPU, memory and disk use | Inside the stack only |
| Grafana | Charts the data | Port 3000 on the host (`GRAFANA_PORT`) |

Open `http://<host>:3000` and sign in to Grafana as `admin` with the password from `GRAFANA_ADMIN_PASSWORD` (`admin` unless set). Grafana asks you to choose a new password. Then add a data source of type Prometheus with the URL `http://prometheus:9090`.

Prometheus data is kept in the `prometheus_data` volume and Grafana's in `grafana_data`.

## Metrics

The backend exposes Prometheus metrics at `/api/metrics` inside the stack. The proxy answers that path with 404, so the metrics are never public.

Besides the standard HTTP request metrics, Ludexis counts:

| Metric | Counts |
| --- | --- |
| `ludexis_auth_login_success_total` | Successful sign-ins |
| `ludexis_auth_login_failure_total` | Failed sign-ins |
| `ludexis_library_scans_total` | Full scans |
| `ludexis_incremental_scans_total` | Scans for changes |
| `ludexis_metadata_searches_total` | Metadata searches |
| `ludexis_artwork_downloads_total` | Artwork downloads |
| `ludexis_artwork_validation_failures_total` | Artwork that failed to download or validate |
| `ludexis_artwork_deduplications_total` | Artwork deduplications |
| `ludexis_artwork_auto_download_runs_total` | Runs of the missing-artwork download |

:::note
These counters are kept per process, and Prometheus scrapes the backend. Work done inside background jobs, such as scans, automatic matching and most artwork downloads, runs in the worker and is not included. Sign-ins and searches from the **Identify** dialog are counted.
:::
