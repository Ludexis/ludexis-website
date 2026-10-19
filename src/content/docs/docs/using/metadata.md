---
title: Metadata and Identify
description: Where game details come from, how sources are ordered, and how to fix a missing or wrong match.
---

When a scan adds a game, Ludexis searches its metadata sources for the title it read from the file or folder name, and fills in the description, release date, genres, developers, publishers, tags, screenshots and artwork.

## The sources

| Source | Key needed | Good for |
| --- | --- | --- |
| VNDB | No | Visual novels and Ren'Py games |
| IGDB | A Twitch client ID and secret | Most commercial games |
| Steam | No | Steam releases, descriptions and screenshots |
| SteamGridDB | An API key | Community covers, banners and logos (artwork only) |

IGDB signs in through a Twitch developer application: create one in the Twitch developer console and copy its client ID and secret. Enter them during setup, under **Admin > Settings > IGDB**, or as `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET` in `.env`. Without them, IGDB searches return nothing.

The SteamGridDB key comes from the Preferences, API page of your SteamGridDB account. Enter it under **Admin > Settings > SteamGridDB** or as `STEAMGRIDDB_API_KEY`. SteamGridDB does not match games; it adds artwork for games the other sources found. See [Artwork](/docs/using/artwork/).

Values set in `.env` take precedence, and the fields in the web app are then locked.

## Order and matching

**Admin > Settings > Metadata sources** lists the sources that match games, in the order they are tried. The default is VNDB, IGDB, Steam. Use the arrows to reorder them and the checkbox to turn a source off; a source that is off is never searched. [Extra sources](/docs/advanced/providers/) you install appear in the same list, switched off until you enable them.

For each new game, Ludexis searches the enabled sources in order and scores each result by how closely its title matches:

| Score | Result | Shown as |
| --- | --- | --- |
| 85% or more | The search stops at this source; the game is matched. | **Matched** |
| 70% to 85% | The best result from all sources is used. | **Partly matched** |
| Below 70% | Nothing is used; the game waits in the review queue. | **Not identified** |

The source that matched supplies the details. Every other enabled source is then searched for the same game, and fills in what the first one lacks when its result matches the title closely and the release years are no more than a year apart. Developer and publisher names that differ only in case, punctuation, a leading "The" or a legal suffix are stored as one company.

When one version of a game is already matched, its other versions reuse that match instead of searching again.

## Identify

When a match is missing or wrong, open the game and choose **Identify**.

1. Check the **Title**, which starts as the current one. Add a **Developer** to tell apart games with the same name.
2. Pick a **Source**, or **All sources**, and choose **Search**.
3. Choose **Select** next to the right result.

The chosen record replaces the details of this file, and its artwork is downloaded again in the background. If the game has several versions, **Also apply to the other versions of this game** applies the record to all of them; it is off by default, so you can move one wrongly grouped file to another game without touching its siblings. After an Identify, Ludexis regroups the library, so a file matched to another game leaves its old card.

Identify needs the **Edit metadata** permission.

## The review queue

**Admin > Metadata > Review queue** lists the games a scan could not identify on its own. The admin overview counts them, and a red dot marks the tab while any are waiting. For each game you can:

| Action | Effect |
| --- | --- |
| **Identify** | Search the sources, as above. |
| **Edit by hand** | Type a title, description and release date yourself. Hand-edited details are kept: metadata refreshes skip the game until it is identified again. |
| **Mark resolved** | Keep the game as it is and take it off the open list. **Reopen** puts it back. |

## Keeping details up to date

The **Refresh metadata** scheduled task runs every night at 03:00 by default. It refreshes the games that have a matched source and tries the games that were never searched. Games that were searched and left unidentified are not searched again; they wait in the review queue. Hand-edited games are skipped.

A refresh replaces the tags that came from a source and keeps the tags you added yourself. It sets a game's franchise only when the game has none.

To run it now, use **Run now** on the task under **Admin > Tasks**, or start **Refresh metadata** from the Jobs tab. See [Jobs and schedules](/docs/using/jobs/).

## Source warnings

When a source can no longer answer normally, for example because its sign-in expired or a rate limit was reached, a warning appears in the top bar for users who can edit metadata. It disappears on its own once the source recovers or the warning lapses.
