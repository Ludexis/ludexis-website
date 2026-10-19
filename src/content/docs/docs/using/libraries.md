---
title: Libraries and scans
description: Add library folders on the server or an edge device, and how full, quick and automatic scans work.
---

A library is a folder that holds games. Ludexis walks it, makes one entry per game it finds, and keeps the entries in sync with the folder at every scan. Libraries are managed under **Admin > Libraries**.

## What a scan finds

| On disk | Becomes |
| --- | --- |
| A `.zip`, `.rar`, `.7z`, `.iso` or `.exe` file | One entry |
| A folder that holds any other kind of file | One entry for the whole folder, as an unpacked game; its subfolders are part of it |
| A folder that holds only archives and subfolders | Nothing itself; the scan looks inside it |

Hidden files, `desktop.ini` and `thumbs.db` do not make a folder count as a game. Folders that cannot be read are skipped and logged.

So you can organise a drive however you like, for example `/games/Visual novels/Some Game v1.2.zip` or `/games/RPG/Some Game/` with the game's files inside.

## Adding a library

Choose **Add library** and fill in:

| Field | What to enter |
| --- | --- |
| **Name** | A name of your choice; each library needs its own. |
| **Folder path** | The folder as the machine that scans it sees it. |
| **Location** | **Server (this host)**, or one of your [edge devices](/docs/edge/overview/). |

For a library on the server, the path is the one inside the containers: `/games`, or a folder inside it such as `/games/Visual novels`. For a library on an edge device, it is the path as that machine shows it, such as `/media/you/Games` on Linux or `E:\Games` on Windows. A path can be used once per machine.

A library on an edge device is scanned by that device at its next check-in. For a library on the server, choose **Scan** on its row to fill it. The nightly scheduled scan only counts new files, as described under [automatic scans](/docs/using/libraries/#automatic-scans-and-the-pending-changes-prompt), so it does not add the games of a new library by itself.

The **Enabled** switch on each row leaves a library out of scans of everything. You can still scan it on its own from its row.

:::tip
The stack mounts one host folder, `GAMES_PATH`, at `/games`. To catalogue a folder outside it on the server, either point `GAMES_PATH` at a common parent folder, or mount the extra folder read-only into the `backend`, `worker` and `beat` services with a `docker-compose.override.yml`, the way `/games` is mounted.
:::

**Edit** in a row's menu changes the name, path or location. **Remove** takes the library's games out of the catalogue; the files on disk are not touched.

## Scan and Full scan

The buttons at the top of the page scan every enabled library. Each row also has its own buttons.

| | What it does |
| --- | --- |
| **Scan for changes** (or **Scan** on a row) | Looks only at files that are new or whose size or modification time changed, and hashes those. Everything else is left as it is. This is the usual scan. |
| **Full scan** | Goes through every file again. Unchanged files that already have a hash are not read again; files without one are hashed. |

Both kinds of scan also:

- recognise moved and renamed files by their SHA-256 hash, so a game keeps its metadata and artwork when you reorganise a folder;
- mark entries whose file is gone as **File missing**, and clear the mark when the file comes back;
- group versions and episodes of a game under one card (see [Versions, collections and franchises](/docs/using/organising/));
- start a metadata job for the games they added.

A copy of the same file in two places becomes two entries, which the **Duplicates** tab under **Admin > Metadata** lists together. A game you delete from its page stays deleted; later scans do not add it back.

## Offline drives

Before scanning a library on the server, Ludexis checks its folder. A library is marked **Offline** when the folder is missing or unreadable, or when it is empty while the library still has games. An unplugged drive behind a Docker bind mount looks exactly like that: an empty folder.

An offline library is skipped. Its games stay in the catalogue with all their details, and they are not marked missing. When the folder is back, the next scan relinks the library in full, without hashing the files it already knows again.

Libraries on edge devices go offline the same way when the device reports that their drive is not connected. See [How edge scans work](/docs/edge/scans/).

## Automatic scans and the pending-changes prompt

A scan that nobody started, such as the nightly scheduled scan or an edge device's scan when a drive is plugged in, reads no files at all. It compares paths and sizes with what Ludexis already knows:

- files that are unchanged keep their entries;
- files that are gone are marked missing;
- new files, and files whose size changed, are only counted.

The count shows on the library's row as "N new or changed files to check; press Scan to add them". The next time you open **Admin > Libraries**, a dialog titled **New games may have been added** lists the libraries with pending files. **Check for changes** starts a scan of each of them, which reads and adds the files; **Later** closes the dialog until your next visit.

A scan you start yourself resets the count of each library it covers.

:::note
This keeps a drive that comes back, or a nightly scan of a large library, from hashing hundreds of gigabytes at an unexpected moment. You decide when the new files are read.
:::

## Watching a scan

Every scan is a job. Running jobs show in the top bar, and **Admin > Tasks > Jobs** shows their progress, history and a **Cancel** button. See [Jobs and schedules](/docs/using/jobs/).
