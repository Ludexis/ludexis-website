---
title: How edge scans work
description: Scans you start, automatic scans, autoscan, drive identity and offline libraries on edge devices.
---

An edge device never decides on its own what to scan. At every check-in, every 15 seconds, the server tells it which libraries are its own and which scans are waiting. The device runs one scan at a time and keeps checking in while it works, reporting its progress every couple of seconds.

## Two kinds of scan

What the device reads depends on who asked for the scan:

| | Scan you start | Automatic scan |
| --- | --- | --- |
| Started by | **Scan** or **Full scan** on the Libraries page, **Scan for changes**, adding a library or changing its location | Autoscan when a drive connects, or a scheduled task |
| Files it reads | New files and files whose size or modification time changed, which it hashes | None |
| New or resized files | Added to the catalogue | Only counted, as pending changes |
| Unchanged files | Kept with their stored hash | Kept with their stored hash |
| Files that are gone | Marked **File missing** | Marked **File missing** |

On an edge device, **Full scan** and **Scan** both hash only new or changed files.

After an automatic scan, the library's row on **Admin > Libraries** shows how many files are waiting, and the next visit to that page asks whether to check them. **Check for changes** starts a scan of those libraries that reads and adds the files. See [automatic scans](/docs/using/libraries/#automatic-scans-and-the-pending-changes-prompt).

A drive that comes back is never hashed again in full. Only files that are new or changed are ever read.

Metadata is always looked up by the server. Once the device has sent its listing, the server stores it and starts the usual metadata job for the games it added.

## Autoscan

With **Autoscan** on, which is the default, a drive that was not there at the device's previous check-in triggers an automatic scan of the libraries on it. An offline library whose drive is not known yet, because it was never scanned, is scanned when any drive connects.

Turn **Autoscan** off on **Admin > Edge** to scan only when you ask.

On Linux, plugging in a known drive also mounts it and starts the device, so plugging it in is all it takes. On Windows, run `ludexis-edge restart` after plugging a drive in, so Docker Desktop sees it.

## Drive identity

The first scan of a library records the drive it lies on: its filesystem UUID on Linux or its volume serial on Windows, the folder's path below the drive, and where the drive was mounted. From then on the device finds the library by its drive, wherever and under whichever letter the drive is mounted.

Linux shows an NTFS drive's 64-bit serial and Windows its low 32 bits. Both end in the same eight hex digits, which is what Ludexis compares, so the drive is recognised under either system.

Changing a library's location to another device or to the server clears its drive, and the next scan records it again.

## Offline libraries

A library goes **Offline** when the device reports that its drive is not connected, that its folder is not found, or that its drive letter is not mapped, and also when the device sends an empty listing for a library that has games. Nothing else changes: the games stay with all their details, and they are not marked missing. The reason shows on the library's row.

When the drive is back, the next scan brings the library online again and relinks its files without hashing them again.

## Waiting scans

Scans asked for while the device is off wait for it, one per library however often they are asked for. A waiting scan is cancelled when its library is moved to another location, and marked failed if the device does not check in within 7 days. A running scan fails when the device has not checked in for an hour.

The server never sees an edge device's drives, so the weekly **Verify archive integrity** task skips edge libraries.
