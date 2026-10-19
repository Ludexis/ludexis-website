---
title: Overview
description: What an edge device is, how to add one under Admin > Edge, and what its install files contain.
---

An edge device is another machine, such as a laptop or a desktop PC, that scans the drives attached to it and sends what it finds to your Ludexis server. The server keeps the only database and does all the metadata lookups; the device only reads its own drives.

Edge devices are optional. Libraries on the server work the same with or without them.

## How it works

The device runs the Ludexis backend image in Docker, in a mode that has no database or Redis of its own. Every 15 seconds it checks in with the server using its own token, reporting its drives and asking whether a scan is waiting. It only makes outgoing connections, so it needs no open port; it only needs to reach the server's address.

When a library on the device needs scanning, the device walks the folder, hashes the files that need it, and uploads the listing. The server stores it the same way as a scan of its own, then fetches metadata and artwork for any new games.

A device missing three check-ins in a row shows as offline. Scans asked for while it is off wait until it is back.

## Requirements

| Machine | Needs |
| --- | --- |
| Windows | Docker Desktop, started at least once |
| Linux | Docker Engine with the Compose plugin, systemd and udev |

Both need to reach the server over the network. Keep the device on the same release as the server; **Admin > Edge** marks a device that runs another release with "Runs another release than the server: update it".

## Adding an edge device

1. On the server, open **Admin > Edge** and choose **Add edge**. Give the device a name, such as `Laptop`.
2. The **Set up** dialog appears. Pick **Windows** or **Linux** and choose **Download for Windows** or **Download for Linux**.
3. Copy the zip file to the device and run its installer: see [Windows](/docs/edge/windows/) or [Linux](/docs/edge/linux/).
4. On the server, open **Admin > Libraries** and choose **Add library**. Enter the folder path as the device shows it, such as `E:\Games` or `/media/you/Games`, and pick the device as the **Location**.

The device scans the new library at its next check-in.

:::caution
The install files contain the device's token, which is shown only once. Download them before you close the dialog. If you lose them, choose **New token and install files** in the device's menu; the old token stops working at once.
:::

## The install files

The zip, `ludexis-edge-windows.zip` or `ludexis-edge-linux.zip`, unpacks into a `ludexis-edge` folder:

| File | Purpose |
| --- | --- |
| `.env` | The device's settings, with the server address and its token filled in |
| `docker-compose.yml` | Runs the device container |
| `install.ps1`, `ludexis-edge.ps1`, `ludexis-edge.cmd` | Windows: the installer and the [`ludexis-edge` command](/docs/edge/commands/) |
| `install.sh`, `ludexis-edge`, `ludexis-drive`, `ludexis-drive@.service`, `99-ludexis-edge.rules` | Linux: the installer, the command, and the helper that mounts known drives when they are plugged in |
| `README.txt` | Short instructions |

The server address in `.env` is the address you had open in the browser when you downloaded the files. If the device should reach the server another way, edit `LUDEXIS_SERVER_URL` in the installed `.env`.

## The device settings

The device's `.env` holds:

| Setting | Meaning |
| --- | --- |
| `LUDEXIS_SERVER_URL` | The server the device reports to. |
| `LUDEXIS_EDGE_TOKEN` | The device's token. Keep the file private. |
| `EDGE_HOSTNAME` | The name shown on the server. The installer fills in the machine's name. |
| `LUDEXIS_VERSION` | Image tag of the device. Keep it on the server's release. |
| `EDGE_ROOTS` | Linux only: extra folders, separated by `:`, that hold library folders outside `/media`, `/mnt` and `/run/media`. |
| `TZ` | Time zone of the device container. |

After changing a setting, run `ludexis-edge restart`.

## Managing devices

**Admin > Edge** lists each device with its system, release and host name, its status (**Online**, **Offline** or **Not set up yet**) and when it was last seen. Under **Drives and libraries** it shows each drive the device sees, its free space, and the libraries on it; libraries whose drive is not connected are grouped under the drive they were last seen on.

| Control | Effect |
| --- | --- |
| **Autoscan** | Scan a library as soon as its drive connects to the device. On by default. See [How edge scans work](/docs/edge/scans/). |
| **Rename** | Change the name shown here and as the location of its libraries. |
| **New token and install files** | Issue a new token. The device stops working until it is set up again with the new install files. |
| **Remove** | Revoke the device. Its libraries and games stay, show as offline, and fall back to the server until you give them another location. Its waiting scans are cancelled. |

The **Edge locations** card on **Admin > Overview** shows the same devices at a glance.
