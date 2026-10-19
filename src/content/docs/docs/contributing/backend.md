---
title: Backend
description: The layout of ludexis-backend and how to add a migration, an API route, a service or a metadata provider.
---

The backend is a FastAPI app on Python 3.12, with SQLAlchemy 2, Alembic, Celery 5 and PostgreSQL 16. Set it up first as described in [Repositories and setup](/docs/contributing/setup/).

## Project layout

```text
app/
  api/            FastAPI routers, one module per resource
  core/           settings, authentication, access rules, logging, metrics, rate limits
  db/             engine and session setup
  models/         SQLAlchemy models
  schemas/        Pydantic request and response models
  repositories/   database queries
  services/       business logic: scanning, metadata, artwork, grouping, jobs
  providers/      metadata providers (VNDB, IGDB, Steam, SteamGridDB) and the plugin loader
  edge/           the edge device process (python -m app.edge) and its install files (bundle/)
  tasks/          Celery app, job runner and task modules
  utils/          shared helpers
alembic/          database migrations
bin/ludexis       container entry point: server, worker, beat, edge, health <role>
scripts/          admin tools: reset_password, seed_demo
tests/            pytest suite
main.py           application entry point
```

A request goes from a router in `app/api/` to a service in `app/services/`, which uses repositories in `app/repositories/` for queries. Routers stay thin: they check access, call a service and return a schema. Settings come from `app/core/config.py`, read from the environment or `.env`.

## Add a migration

Every change to a model needs an Alembic migration. Alembic's `env.py` imports everything in `app.models`, so a new model must be imported in `app/models/__init__.py` to be seen.

1. Change or add the model in `app/models/`.
2. Create the migration:

   ```bash
   alembic revision --autogenerate -m "describe the change"
   ```

3. Read the new file in `alembic/versions/`. Autogenerate misses some changes, such as server defaults on existing rows or data moves, so fill those in by hand, and check that `downgrade()` reverses `upgrade()`.
4. Apply it:

   ```bash
   alembic upgrade head
   ```

Existing migrations add a `server_default` to new non-null columns, so rows that already exist get a value. For example, `libraries.pending_changes` was added with `server_default='0'`.

The container runs `alembic upgrade head` before it starts the API, so deployments migrate on their own. CI also runs the migrations against an empty database before the tests.

## Add an API route

1. Add a router module in `app/api/`, or a route to an existing one:

   ```python
   from fastapi import APIRouter, Depends
   from sqlalchemy.orm import Session

   from app.core.auth import get_current_active_user, require_permission
   from app.db.session import get_db
   from app.utils.enums import PermissionName

   router = APIRouter(prefix="/things", tags=["things"])
   ```

2. Protect each route with a dependency: `get_current_active_user` for any signed-in user, or `require_permission(PermissionName.RUN_SCANS)` and the like for a permission. Get the session with `db: Session = Depends(get_db)`.
3. Put request and response models in `app/schemas/` and set `response_model` on the route. Give each route a `summary` and `description`; they appear in the API docs at `/docs`.
4. List endpoints take `offset` and `limit` and set the total in the `X-Total-Count` response header, which the web app reads.
5. Record actions worth auditing with `AuditService` and an action from `app/utils/audit_actions.py`.
6. Include a new router in `api_router` in `app/api/__init__.py`. It is mounted under `/api`.

Add tests in `tests/` that call the route through FastAPI's `TestClient`, as the existing API tests do.

## Add a service

A service is a plain class in `app/services/` that takes the session as its first argument. It holds the logic and uses a repository for queries:

- Repositories extend `BaseRepository` in `app/repositories/base.py`, which provides `create`, `get`, `list_items`, `update` and `delete`. `delete` sets `deleted_at` on models that have it instead of removing the row.
- Work that takes longer than a request belongs in a job. Add a task in `app/tasks/` decorated with `@celery_app.task(**JOB_TASK_OPTIONS)` that calls `run_job`, and start it through `JobService.start_job`. See [Jobs and workers](/docs/architecture/jobs/).
- Log with `get_logger(__name__)` from `app.core.logging`, passing details in `extra`. Logs are written as JSON.

## Add a metadata provider

A provider subclasses `MetadataProvider` in `app/providers/metadata_provider.py`:

```python
from app.providers.metadata_provider import MetadataProvider
from app.schemas.metadata import MetadataDetails, MetadataSearchResult


class ExampleProvider(MetadataProvider):
    name = "Example"
    priority = 50

    def search(self, query: str, limit: int = 20, developer: str | None = None) -> list[MetadataSearchResult]:
        ...

    def get_details(self, external_id: str) -> MetadataDetails | None:
        ...
```

- `search` returns `MetadataSearchResult` items with `provider`, `provider_id` and `title`, plus an optional summary, release date, cover URL and developers. It may ignore `developer` when the source cannot filter by it.
- `get_details` returns a `MetadataDetails` with the description, release date, genres, developers, publishers, tags, franchises and artwork URLs (`cover_urls`, `banner_urls`, `logo_urls`, and `artwork_urls` for screenshots).
- An exception in either method is logged and treated as no result, so one failing source never fails a job. `NotImplementedError` is treated the same way.

There are two ways to ship it:

- **As a plugin.** Put the module in the folder named by `PROVIDER_PLUGINS_DIR`. Every non-abstract `MetadataProvider` subclass defined in a `*.py` file there is loaded at startup. A broken plugin is logged and skipped. See [Metadata providers](/docs/advanced/providers/).
- **Built in.** Add the module to `app/providers/`, export it from `app/providers/__init__.py`, add it to the default list in `MetadataService.__init__` and to `match_provider_names` in `app/services/settings.py`.

Either way, a provider takes part in automatic matching only once its name is in the `provider_order` setting. Matching and the merge rules are described in [Metadata matching](/docs/architecture/metadata/).

## Code style and tools

- **Python 3.12**, the version of the image and of CI.
- **Dependencies** are pinned to exact versions in `requirements.txt`; `requirements-dev.txt` adds `pytest`. Add a dependency only when the existing ones cannot do the job.
- **Tests** are configured in `pytest.ini`: `testpaths = tests`, with deprecation warnings from `jose` filtered out. See [Tests and CI](/docs/contributing/testing/).
- There is no formatter or linter configuration in the repository. Follow the style of the surrounding code: type hints on signatures, business logic in `app/services`, queries in `app/repositories`, and comments only where the reason is not obvious from the code.
