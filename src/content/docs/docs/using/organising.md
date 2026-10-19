---
title: Versions, collections and franchises
description: How versions and episodes are grouped, and how collections, franchises, developers, publishers, genres and tags organise the library.
---

## Versions

Several files of the same game appear as one card. Ludexis groups them in two ways:

- by the title it reads from the file or folder name, after dropping version numbers, build counters, resolution tags and similar noise;
- by their match: files identified as the same game join one card, whatever their names.

The card shows the primary version, which is the latest episode, then the newest version, then the most recently modified file. The game page gets a **Versions** tab that lists every version, newest first, with a label such as `Ep 2 · v1.0`.

File names are read like this:

| In the name | Read as |
| --- | --- |
| `[v1.0e]`, `v1.2.3` | Version |
| `0-20-16`, when there is no dotted version | Version `0.20.16` |
| `(2019)` | Release year, not a version |
| `Ep 3`, `EP03`, `Episode`, `Chapter`, `Ch.`, `Part`, `Season`, `S01E03`, `Book` | Episode, season or part of a series |

A file that ended up on the wrong card can be moved: open it and use [Identify](/docs/using/metadata/#identify) without applying the match to the other versions.

## Episodes

Files that are episodes of one series, such as `Some Story Ep 1` and `Some Story Ep 2`, are kept as separate games, because each is its own release. Ludexis gathers them into a collection named after the series and records their order.

These collections are maintained by the scans. If you delete one, it is not created again.

## Collections

Collections are named sets of games that you put together yourself. Everyone can browse them under **Collections**.

With the **Manage collections** permission you can:

- create one with **Create a collection** on the Collections page;
- add games from a game's **⋯** menu with **Add to collection**, or select several games in the **Library** and add them at once;
- rename a collection, describe it or give it a banner with **Edit** on its page, or delete it.

Collections also decide what each account sees: under **Admin > Users**, **Manage access** can hide every game of a collection from one user. See [Users, roles and access](/docs/using/users/#what-each-user-sees).

## Franchises

A franchise is a game series. Matched games get their franchise from the metadata sources; a refresh sets it only when a game has none yet. Franchises are shown as image cards under **Franchises**; [Artwork](/docs/using/artwork/#franchise-images) explains how the image is chosen.

## Developers, publishers, genres and tags

| | Where it comes from | Where to find it |
| --- | --- | --- |
| **Developers** | Metadata sources | **Developers** page, game page |
| **Publishers** | Metadata sources | **Publishers** page, game page |
| **Genres** | Metadata sources | Game page, Library filter |
| **Tags** | Metadata sources | **Tags** page, game page |

Company names that differ only in case, punctuation, a leading "The" or a legal suffix are stored as one developer or publisher, under the first spelling seen.

With the **Edit metadata** permission you can add, edit and delete developers, publishers, franchises and tags from their pages. Developers and publishers have a description and a website, franchises a description, and tags a description and a colour. A metadata refresh replaces only the tags that came from a source; other tags stay.

## Filtering the library

The **Library** page filters by genre, tag, developer, publisher, franchise, collection, metadata status and file status, and can be sorted. Opening a developer, publisher, franchise, tag or collection lists its games.

## Favourites and completed

Every user can mark a game with **Add to favourites** and **Mark completed** on its page. The marks are personal: each user has their own, and the **Favourites** page lists yours.
