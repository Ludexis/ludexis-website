---
title: Artwork
description: How covers, banners, logos and screenshots are fetched, stored, repaired and replaced.
---

Every game can have four kinds of artwork:

| Kind | Used for |
| --- | --- |
| **Cover** | The portrait card in the library, in a 2:3 shape |
| **Banner** | The wide backdrop of the game page |
| **Logo** | The title art on the game page, on a transparent background |
| **Screenshots** | The Screenshots tab of the game page |

## Where it comes from

When a game is matched, Ludexis picks the best image of each kind from the matched sources and downloads it. With a SteamGridDB API key set, SteamGridDB's community covers, banners and logos are offered as well, which fills many gaps the other sources leave.

Covers always fit the card. Art with another shape is cropped to 2:3 around its most detailed part, and an animated image is replaced by its most detailed frame. A game whose sources offer no cover gets one cut from a banner.

## Stored locally

Artwork is downloaded once and kept on your server in `/data/artwork`, on the `ludexis_data` volume. The library keeps looking the same if a source changes an image or goes away. Images are served by the backend under `/media`, and only to signed-in users who may see the game.

Back up the `ludexis_data` volume to keep your artwork; see [Updating and backups](/docs/start/updating/).

## Missing artwork

**Admin > Metadata > Missing artwork** lists the games that lack a cover, banner, logo or screenshots.

- **Download missing artwork** starts a background job that fetches whatever is missing for every game from its metadata sources.
- **Manage artwork** next to a game opens the artwork dialog for it.

## Validation and repair

The **Validate artwork** scheduled task runs every night at 04:00 by default. It checks every stored cover, banner and logo, and the screenshot files, and finds the ones that are missing or cannot be read as images. Broken artwork of matched games is downloaded again. It never touches your game files.

## Changing artwork by hand

On a game's page, open the **⋯** menu and choose **Manage artwork**. For each kind of artwork:

| Button | Effect |
| --- | --- |
| **Find** | Shows the images the game's matched sources offer for that slot. Pick one to download it. |
| **Upload** or **Replace** | Uses an image file from your computer. |
| Delete (the bin icon) | Removes the image. |

**Upload screenshot** adds screenshots; a game can have as many as you like.

Uploads must be JPEG, PNG, WebP, GIF or AVIF images of at most 10 MB. Both limits can be changed with `ALLOWED_ARTWORK_MIME_TYPES` and `MAX_ARTWORK_SIZE_MB`; see [Configuration](/docs/start/configuration/#storage).

Identifying a game again with **Identify** replaces its artwork with the new match's. Managing artwork needs the **Edit metadata** permission.

## Franchise images

A franchise card shows the banner of the franchise's first released game unless you choose an image. On a franchise's page, **Image** opens a dialog that offers the banners of its games, SteamGridDB artwork for a game with the franchise's exact name, and the games' screenshots, or lets you upload your own. **Use automatic** goes back to the default. A chosen image is copied, so changing a game's art later does not affect it.
