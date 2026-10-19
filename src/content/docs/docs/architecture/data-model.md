---
title: Data model
description: The PostgreSQL tables behind Ludexis, drawn from the SQLAlchemy models, and what each one holds.
---

Every table is defined as a SQLAlchemy model in `backend/app/models/`, with the many-to-many tables in `association_tables.py`. Alembic migrations in `backend/alembic/versions/` create and change them. Most primary keys are UUID strings (`String(36)`).

The diagrams below show the key columns, not every column. Timestamps such as `created_at` and `updated_at` are left out unless they matter.

## Catalogue

```mermaid
erDiagram
    libraries ||--o{ archive_entries : "holds"
    archive_entries ||--o{ screenshots : "has"
    franchises |o--o{ archive_entries : "groups"
    franchises |o--o{ franchises : "parent of"
    archive_entries |o--o{ archive_entries : "parent series of"
    archive_entries }o--o{ genres : "archive_entry_genres"
    archive_entries }o--o{ tags : "archive_entry_tags"
    archive_entries }o--o{ developers : "archive_entry_developers"
    archive_entries }o--o{ publishers : "archive_entry_publishers"
    collections }o--o{ archive_entries : "collection_entries"
    archive_entries ||--o{ archive_entry_relations : "source of"
    archive_entries ||--o{ archive_entry_relations : "target of"

    libraries {
        string id PK
        string name UK
        text path
        bool enabled
        string status
        datetime last_scan_at
        text last_error
        string edge_id FK
        string drive_id
        int pending_changes
        datetime deleted_at
    }
    archive_entries {
        string id PK
        string title
        string version
        string archive_type
        text file_path
        text relative_path
        bigint file_size
        datetime modified_time
        string file_hash
        enum metadata_status
        string metadata_source
        string metadata_source_code
        float metadata_confidence
        bool metadata_override
        enum verification_status
        string group_key
        string series_key
        int season
        int episode
        bool is_primary_version
        bool review_resolved
        string parent_series_id FK
        string franchise_id FK
        string library_id FK
        datetime deleted_at
    }
    screenshots {
        string id PK
        string archive_entry_id FK
        text file_path
        string caption
    }
    franchises {
        string id PK
        string name UK
        text banner_path
        string parent_id FK
    }
    collections {
        string id PK
        string name
        string visibility
        string auto_key UK
        datetime deleted_at
    }
    genres {
        string id PK
        string name UK
    }
    tags {
        string id PK
        string name UK
        string color
        string origin
    }
    developers {
        string id PK
        string name UK
        string name_key UK
    }
    publishers {
        string id PK
        string name UK
        string name_key UK
    }
    archive_entry_relations {
        string source_entry_id PK
        string target_entry_id PK
        enum relationship_type
    }
```

`archive_entries` also stores `description`, `release_date`, `engine`, `storage_device`, `cover_path`, `banner_path`, `logo_path`, `last_metadata_refresh` and `last_verified`.

## Accounts

```mermaid
erDiagram
    users }o--o{ roles : "user_roles"
    roles }o--o{ permissions : "role_permissions"
    users ||--o{ refresh_tokens : "has"
    users ||--o{ user_entry_flags : "marks"
    archive_entries ||--o{ user_entry_flags : "marked in"
    users |o--o{ audit_logs : "acts in"

    users {
        string id PK
        string username UK
        string email UK
        string hashed_password
        bool is_active
        bool is_superuser
        bool must_change_password
        datetime sessions_revoked_at
        datetime deleted_at
    }
    roles {
        string id PK
        string name UK
        text description
    }
    permissions {
        string id PK
        string name UK
        text description
    }
    refresh_tokens {
        string id PK
        text token UK
        string user_id FK
        datetime expires_at
        bool revoked
    }
    user_entry_flags {
        string user_id PK
        string archive_entry_id PK
        bool favorite
        bool completed
    }
    audit_logs {
        string id PK
        string user_id FK
        string action
        string entity
        string entity_id
        text details
        datetime created_at
    }
    archive_entries {
        string id PK
    }
```

## Jobs, edge devices and system settings

```mermaid
erDiagram
    edge_devices |o--o{ libraries : "scans"
    edge_devices |o--o{ job_history : "runs"
    libraries |o--o{ job_history : "scanned by"
    users |o--o{ job_history : "started"
    scheduled_tasks }o..o| job_history : "last_job_id"

    job_history {
        string id PK
        enum job_type
        enum status
        int progress
        text details
        text result
        string task_id
        int retry_count
        datetime started_at
        datetime completed_at
        string user_id FK
        string library_id FK
        string edge_id FK
    }
    edge_devices {
        string id PK
        string name UK
        string token_hash UK
        bool autoscan
        datetime last_seen_at
        string version
        string hostname
        string os
        json drives
    }
    libraries {
        string id PK
        string edge_id FK
        string drive_id
        text drive_subpath
        text drive_mount
    }
    users {
        string id PK
    }
    scheduled_tasks {
        string key PK
        string job_type
        bool enabled
        int hour
        int minute
        int day_of_week
        datetime last_run_at
        string last_job_id
    }
    system_settings {
        string key PK
        json value
        datetime updated_at
    }
```

`scheduled_tasks.last_job_id` is a plain column, not a foreign key, so the dotted line marks a loose link.

## Tables

| Table | What it holds |
| --- | --- |
| `libraries` | A folder to scan. `edge_id` is empty for a folder on the server, or names the edge device that has it. `status` is `ONLINE` or `OFFLINE`. `drive_id`, `drive_subpath` and `drive_mount` record the drive a library lives on after its first edge scan. `pending_changes` counts new or resized files that an automatic scan found but did not store. A unique index covers the path per machine. |
| `archive_entries` | One file or game folder: a single version of a game. Holds the file facts (`file_path`, `relative_path`, size, modified time, SHA-256 `file_hash`), the metadata match (`metadata_status`, source, record id, confidence), the artwork paths, and the grouping keys (`group_key` for versions of one game, `series_key`, `season` and `episode` for series). |
| `screenshots` | Downloaded or uploaded screenshots of an entry. Deleted with the entry. |
| `genres`, `tags` | Names linked to entries through `archive_entry_genres` and `archive_entry_tags`. `tags.origin` is `provider` for tags imported from metadata, which a refresh replaces, or `user` for tags people added, which are never touched. |
| `developers`, `publishers` | Companies linked through `archive_entry_developers` and `archive_entry_publishers`. `name_key` is a spelling-independent form of the name, so "SEGA" and "Sega" are one record. |
| `franchises` | A franchise, optionally nested under a parent. Entries point at one through `archive_entries.franchise_id`. |
| `franchise_entries` | A franchise-to-entry association table that is still defined but not used; membership is `archive_entries.franchise_id`. |
| `collections` | A named list of entries, linked through `collection_entries`. `auto_key` is set on collections the scanner creates for a series. |
| `archive_entry_relations` | Directed links between entries with a `relationship_type`: `FRANCHISE`, `SEQUEL`, `PREQUEL`, `SPINOFF`, `COLLECTION`, `EPISODE`, `REMASTER` or `RELATED`. The scanner maintains the `EPISODE` links between consecutive episodes. |
| `users` | Accounts. `sessions_revoked_at` rejects access tokens issued before it; `must_change_password` is set on the default administrator. |
| `roles`, `permissions` | Role-based access. Users get roles through `user_roles`, and roles get permissions through `role_permissions`. The built-in roles are Administrator, Moderator, User and ReadOnly. |
| `refresh_tokens` | Refresh tokens, stored as SHA-256 digests, never as the token itself. |
| `user_entry_flags` | One user's favourite and completed marks on one entry. |
| `audit_logs` | Who did what: an action, the entity type and id, and details. |
| `job_history` | Every background job, with its type, status, progress and result. `task_id` is the Celery task id. `edge_id` marks a job that an edge device runs. See [Jobs and workers](/docs/architecture/jobs/). |
| `edge_devices` | Registered edge devices. `token_hash` is the SHA-256 of the device token. `drives` is the list of drives the device reported at its last check-in. |
| `scheduled_tasks` | The five scheduled tasks, with their time, optional weekday and last run. |
| `system_settings` | Key-value server settings stored as JSON, such as the server name, the metadata provider order and source credentials entered in the web app. |

## Enumerations

| Enum | Values |
| --- | --- |
| `metadata_status` | `MATCHED`, `PARTIAL`, `UNMATCHED`, `MANUAL` |
| `verification_status` | `VERIFIED`, `MISSING`, `MOVED`, `CORRUPTED`, `UNKNOWN` |
| `job_type` | `LIBRARY_SCAN`, `INCREMENTAL_SCAN`, `METADATA_REFRESH`, `ARTWORK_REFRESH`, `DUPLICATE_DETECTION`, `INTEGRITY_VERIFICATION` |
| `job_status` | `PENDING`, `RUNNING`, `SUCCESS`, `FAILED`, `CANCELED` |

## Deletes

Entries, libraries, collections and users have a `deleted_at` column. Deleting them through the API sets that column instead of removing the row, so a game a user deleted is not added again by the next scan. Association rows, screenshots and per-user flags are removed with their entry by `ON DELETE CASCADE`.

## Search indexes

Titles, descriptions and the names of collections, franchises, tags, developers and publishers have GIN trigram indexes (`gin_trgm_ops`). They speed up the `ILIKE` substring searches behind the library search.
