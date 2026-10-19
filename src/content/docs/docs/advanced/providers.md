---
title: Extra metadata sources
description: Add your own metadata provider as a Python module loaded from PROVIDER_PLUGINS_DIR.
---

Besides VNDB, IGDB and Steam, Ludexis can match games against sources you add yourself. A source is a Python module in a folder that you mount into the stack and name in `PROVIDER_PLUGINS_DIR`. Ludexis itself stays unchanged.

## How plugins are loaded

At startup, every `*.py` file in `PROVIDER_PLUGINS_DIR` is imported. Each class in it that subclasses `MetadataProvider`, is defined in that file and is not abstract becomes a source; Ludexis creates one instance of it, without arguments.

A module that fails to import is logged as `Provider plugin failed to load` and skipped, so a broken plugin never keeps the server from starting. Plugins are loaded once per process: restart the backend and worker after changing one.

A new source appears under **Admin > Settings > Metadata sources**, switched off. Tick it and move it to the place in the order you want; see [Metadata and Identify](/docs/using/metadata/#order-and-matching).

## The interface

A provider has a name and two methods:

```python title="example_source.py"
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

| Member | Meaning |
| --- | --- |
| `name` | The source's name, shown in the settings, the Identify dialog and on matched games. It is stored with every game matched through the source and used to refresh it later, so keep it stable. It must differ from the other sources' names. |
| `priority` | Order among the sources when no order is given, lowest first. The default is `100`; the built-in sources use 5 to 20. Matching follows the order in the settings instead. |
| `search()` | Returns up to `limit` results for a title. `developer`, when given, comes from the Identify dialog; use it to narrow the search if your source can, or ignore it. |
| `get_details()` | Returns the full record for one of your source's IDs, or `None` when there is none. |

### Search results

`search()` returns `MetadataSearchResult` objects:

| Field | Type | Meaning |
| --- | --- | --- |
| `provider` | `str` | Your source's `name` |
| `provider_id` | `str` | The ID that `get_details()` accepts |
| `title` | `str` | The game's title. Automatic matching scores it against the title read from the file name. |
| `summary` | `str` or `None` | A short description, shown in the Identify dialog |
| `release_date` | `date` or `None` | Release date |
| `score` | `float` or `None` | Your source's own relevance score, if it has one |
| `cover_url` | `str` or `None` | A thumbnail for the Identify dialog |
| `developers` | `list[str]` | Developer names, shown in the Identify dialog and used to rank results when a developer is given |

### Details

`get_details()` returns a `MetadataDetails` object:

| Field | Type | Meaning |
| --- | --- | --- |
| `provider`, `provider_id`, `title` | `str` | As in a search result |
| `description` | `str` or `None` | The game's description |
| `release_date` | `date` or `None` | Release date. It also keeps two sources from being merged when their years are more than one apart. |
| `genres`, `developers`, `publishers`, `tags`, `franchises` | `list[str]` | Names, linked to the game on a refresh |
| `cover_urls`, `banner_urls`, `logo_urls` | `list[str]` | Image URLs offered for each artwork slot, best first |
| `artwork_urls` | `list[str]` | Screenshot URLs |

Every list defaults to empty, so fill in only what your source has.

## Errors and warnings

An exception raised by `search()` is logged and treated as no results, and one raised by `get_details()` as no record. A failing source never fails a scan or a refresh. Raising `NotImplementedError` from `search()` makes the source return nothing without logging an error.

When your source can no longer answer normally, for example because its sign-in expired or a rate limit was reached, show a warning to the users who can edit metadata:

```python
from app.providers.notices import clear_notice, set_notice

set_notice(self.name, "Example rate limit reached; searches resume in an hour.", 3600)
clear_notice(self.name)  # once it works again
```

The warning appears in the top bar until it is cleared or its time, in seconds, runs out.

## A complete example

This provider searches a made-up JSON API. The `requests` library, which the built-in sources use, is available in the image. Settings such as an API key are read from the environment, so they can go in `.env`.

```python title="providers/example_source.py"
import os
from datetime import date

import requests

from app.providers.metadata_provider import MetadataProvider
from app.schemas.metadata import MetadataDetails, MetadataSearchResult

API = "https://api.example.com/v1"


class ExampleProvider(MetadataProvider):
    name = "Example"
    priority = 50

    def __init__(self) -> None:
        self.headers = {"Authorization": f"Bearer {os.environ.get('EXAMPLE_API_KEY', '')}"}

    def search(self, query: str, limit: int = 20, developer: str | None = None) -> list[MetadataSearchResult]:
        response = requests.get(f"{API}/games", params={"q": query, "limit": limit}, headers=self.headers, timeout=20)
        response.raise_for_status()
        return [
            MetadataSearchResult(
                provider=self.name,
                provider_id=str(game["id"]),
                title=game["title"],
                release_date=date.fromisoformat(game["released"]) if game.get("released") else None,
                cover_url=game.get("thumbnail"),
            )
            for game in response.json()["results"][:limit]
        ]

    def get_details(self, external_id: str) -> MetadataDetails | None:
        response = requests.get(f"{API}/games/{external_id}", headers=self.headers, timeout=20)
        if response.status_code == 404:
            return None
        response.raise_for_status()
        game = response.json()
        return MetadataDetails(
            provider=self.name,
            provider_id=external_id,
            title=game["title"],
            description=game.get("description"),
            genres=game.get("genres", []),
            developers=game.get("developers", []),
            cover_urls=[game["cover"]] if game.get("cover") else [],
        )
```

## Installing a plugin

1. Put the module in a folder next to `docker-compose.yml`, such as `providers/`.
2. Mount the folder into the backend and the worker with a `docker-compose.override.yml`, which Compose reads automatically:

   ```yaml title="docker-compose.override.yml"
   services:
     backend:
       volumes:
         - ./providers:/providers:ro
     worker:
       volumes:
         - ./providers:/providers:ro
   ```

3. Point Ludexis at it in `.env`, together with any settings the plugin reads:

   ```env title=".env"
   PROVIDER_PLUGINS_DIR=/providers
   EXAMPLE_API_KEY=your-key
   ```

4. Run `docker compose up -d`, then enable the source under **Admin > Settings > Metadata sources**.

If the source does not appear in the list, look for `Provider plugin failed to load` in `docker compose logs backend`.
