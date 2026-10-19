---
title: Introduction
description: What Ludexis is, what it does differently, and where to start.
---

Ludexis is a self-hosted catalogue for game archives. You point it at the folders where your installers, archives, visual novels and backups live, and it turns them into a library you browse in a web browser: every game with its details, artwork, screenshots and versions, for you and the people you share it with.

It never installs, extracts or runs a game. It reads the files as they are and keeps what it learns in its own database.

## Why Ludexis

Most game software assumes a game is something you install and launch. Launchers keep track of the games installed on one computer, and game servers hand out games through their own client app. A shelf of archives spread over several drives fits neither, and that is the case Ludexis is built for.

| | Typical launcher or game server | Ludexis |
| --- | --- | --- |
| What it catalogues | Installed games, or games added one by one | The files themselves: `.zip`, `.rar`, `.7z`, `.iso`, `.exe` and unpacked game folders |
| What each device needs | A launcher or client app | A web browser |
| Visual novels and Ren'Py games | Matched against general game databases | Matched through VNDB, alongside IGDB and Steam |
| An unplugged drive | Games are tracked while installed and reachable | Its games stay in the library, marked offline, and come back when it is plugged in |
| Drives on another computer | Games must be on the machine running it | An [edge device](/docs/edge/overview/) scans them where they are and reports to your server |
| Several versions of one game | Usually separate entries | One card with a Versions tab; episodes are linked in order |

## What else it does

- **Several sources for every game.** The first source with a confident match supplies the details, and the others fill in what it lacks when they clearly describe the same game. When a match is wrong or missing, **Identify** searches every source at once.
- **Artwork kept locally.** Covers, banners, logos and screenshots are downloaded and stored on your server, so the library keeps looking right if a source changes or goes away.
- **Duplicates found by content.** Archives are hashed, so copies of the same file under different names or on different drives are found and listed.
- **Quick rescans.** Scheduled and reconnect scans compare file sizes and hash nothing. New or changed files are counted, and you choose when to look at them.
- **Accounts for everyone you share with.** Roles and permissions decide who can manage libraries and settings, and each account sees only what it is allowed to.
- **Collections, franchises, developers, publishers, genres and tags**, plus favourites and a completed mark for every user.
- **Extra metadata sources** can be added from a folder of provider plugins, without changing Ludexis itself.
- **Open source and easy to run.** MIT licence, one Docker Compose file, and images for amd64 and arm64, so it runs on a home server or a Raspberry Pi.

## Where to start

- [Quick start](/docs/start/quick-start/) gets a server running in a few minutes.
- [Libraries and scans](/docs/using/libraries/) explains how your folders become a library.
- [Edge devices](/docs/edge/overview/) covers drives attached to a laptop or another PC.
- [Architecture](/docs/architecture/overview/) and [Contributing](/docs/contributing/setup/) are for anyone who wants to work on the code.
