---
title: Releases
description: How a Ludexis version is tagged in the three repositories, which image tags it publishes and where its release notes live.
---

A Ludexis release has one version number, `X.Y.Z`, shared by all three repositories. Each repository gets a `vX.Y.Z` tag, and the images of that release carry the same number.

## Where the version is kept

| Repository | File | Field |
| --- | --- | --- |
| ludexis-backend | `app/__init__.py` | `__version__`, shown in the API docs and compared with the version an edge device runs |
| ludexis-frontend | `package.json` and `package-lock.json` | `version`, shown in the web app's settings |
| Ludexis | `docs/release/RELEASE_NOTES.md` | A `## vX.Y.Z (YYYY-MM-DD)` section |

## Steps

1. In **ludexis-backend**, set `__version__` to the new version and commit it as `chore(release): release vX.Y.Z`. Tag that commit `vX.Y.Z` and push the tag.
2. In **ludexis-frontend**, set `version` in `package.json` and `package-lock.json`, commit it as `chore(release): release vX.Y.Z`, tag it `vX.Y.Z` and push the tag.
3. In the **main repository**, move `backend` and `frontend` to the two release commits and add the release's section at the top of `docs/release/RELEASE_NOTES.md`. Commit both as `chore(release): release vX.Y.Z`, tag the commit `vX.Y.Z` and push the tag.

## What a tag starts

### In ludexis-backend and ludexis-frontend

A `v*` tag runs the whole CI workflow:

1. `test`, the same checks as on any push.
2. `publish`, which pushes the image for `linux/amd64` and `linux/arm64` with the version tags.
3. `release`, which creates a GitHub release named `ludexis-backend vX.Y.Z` or `ludexis-frontend vX.Y.Z`. Its notes name the image and link to the main repository's release of the same tag.

### In the main repository

`.github/workflows/release.yml` runs on `v*` tags. It takes the section of `docs/release/RELEASE_NOTES.md` whose heading starts with `## vX.Y.Z `, and creates a GitHub release named `Ludexis vX.Y.Z` with that text. The job fails when the section is missing or empty, so write the notes before pushing the tag.

## Image tags

| Tag | Published when | Use it to |
| --- | --- | --- |
| `:latest` | Every push to `main` | Follow the newest build. The compose file pulls this by default. |
| `:main` | Every push to `main` | The same image as `:latest`, named after the branch |
| `:X.Y.Z` | A `vX.Y.Z` tag | Pin one exact release |
| `:X.Y` | A `vX.Y.Z` tag | Pin a minor release line |

The compose file reads the tag from `LUDEXIS_VERSION` in `.env`, so `LUDEXIS_VERSION=1.2.0` pins a server to that release. See [Updating](/docs/start/updating/). Edge devices have their own `LUDEXIS_VERSION`; keep them on the server's release.

## Release notes

`docs/release/RELEASE_NOTES.md` lists every release, newest first. Each section starts with `## vX.Y.Z (YYYY-MM-DD)` and groups the changes under headings such as the main features, **Upgrading** and **Fixes**. The **Upgrading** part says what an existing installation needs to do: a new `docker-compose.yml`, new settings, or migrations that run on start.

Write the notes for people running Ludexis: what they will notice and what they need to do, not how the code changed.
