---
title: The ludexis-edge command
description: Every ludexis-edge subcommand on Windows and Linux, and what it prints.
---

The installer adds a `ludexis-edge` command that controls the device. On Windows it works in any new terminal; on Linux run it with `sudo`, because the device's `.env` is readable by root only.

```bash
ludexis-edge <command>
```

Run it without a command, or with `help`, for a short summary.

## Commands

| Command | What it does |
| --- | --- |
| `start` | Starts the device. Does nothing if it already runs. |
| `restart` | Checks Docker, the server and the drives, updates the folders mapped into the container, recreates the container, and prints the status. |
| `stop` | Stops the device. Scans asked for while it is stopped run when it starts again. |
| `status` | Prints the server connection and, for each library, whether its drive is here. |
| `logs` | Follows the device's log, starting with the last 100 lines. Press Ctrl+C to stop. |
| `update` | Pulls the newest image for `LUDEXIS_VERSION`, recreates the container and prints the status. |

### On Windows

`start`, `restart`, `status` and `update` start Docker Desktop first if it is not running, and wait up to two minutes for it.

`start`, `restart` and `update` also ask the server for the device's libraries, find the drive letter of each one (by its volume serial once it has been scanned, otherwise by the letter in its path), make late drives visible to Docker Desktop, and map those letters into the container. If the server cannot be reached, the current mapping is kept.

Run `ludexis-edge restart` after adding a library, plugging a drive in or unlocking an encrypted volume. See [Windows](/docs/edge/windows/).

### On Linux

`start`, `restart` and `update` mount the folders listed in `EDGE_ROOTS` into the container. Drives below `/media`, `/mnt` and `/run/media` need no command: they appear in the container as they are mounted. See [Linux](/docs/edge/linux/).

If Docker is not running, the command stops with `Docker is not running: sudo systemctl start docker`.

## Reading the status

`status`, `restart` and `update` end with a summary from inside the container:

```text
Server     https://ludexis.example.com: connected (edge 1.2.0)
Drives     Games at E:\
Library    Games (E:\Games): ready
Library    Archive (F:\Archive): drive not connected
```

| Line | Meaning |
| --- | --- |
| `Server ...: connected` | The server answered and accepted the token. The release of the device follows. |
| `Server ...: not reachable` | The device cannot reach `LUDEXIS_SERVER_URL`. |
| `Server ...: the token was refused` | The token is wrong or was replaced. Download new install files from **Admin > Edge**. |
| `Drives` | The drives the device sees, by label or ID and where they are mounted, or `none`. |
| `Library ...: ready` | The library's folder is there and can be scanned. |
| `Library ...: drive not connected` | The library's known drive is not attached. |
| `Library ...: folder not found` | The library has not been scanned yet and its folder does not exist on this machine. |
| `Libraries none yet` | No library uses this device as its location yet. |

Any other text after a library is a message about its path, such as a drive letter that is not mapped or a folder outside the ones the device can see. [Troubleshooting](/docs/edge/troubleshooting/) explains each one.
