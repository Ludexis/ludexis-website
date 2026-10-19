---
title: Troubleshooting
description: Fixes for edge devices that stay offline, refuse their token, or cannot see a drive or folder.
---

Start with the status on the device. It checks the server, the token and every library's drive:

```bash
ludexis-edge status
```

On Linux, run it with `sudo`. `ludexis-edge logs` follows the device's log for more detail.

## The device shows Offline or Not set up yet

**Not set up yet** means the device has never checked in. **Offline** means it missed three check-ins in a row.

| Check | Fix |
| --- | --- |
| Is the container running? | `ludexis-edge start`. On Windows this also starts Docker Desktop. On Linux, if Docker is not running, `sudo systemctl start docker`. |
| Does `status` say `not reachable`? | The device cannot reach `LUDEXIS_SERVER_URL` in its `.env`. Check the address from the device, for example by opening it in a browser there, and correct it in `.env` if needed. Then run `ludexis-edge restart`. |
| Does `status` say `the token was refused`? | See below. |

While the server is unreachable, the device retries after 5, 15, 30 and then every 60 seconds, so it reconnects on its own once the server is back.

## The token was refused

The token in the device's `.env` is not the device's current token, usually because **New token and install files** was used, or the device was removed and added again.

On the server, open **Admin > Edge**, choose **New token and install files** in the device's menu, download the install files and run the installer again on the device. It keeps the device's folder and replaces its `.env`.

## A library says "drive not connected"

The library's drive was seen before but is not attached now.

- Plug the drive in. On Windows, then run `ludexis-edge restart`.
- On Linux, a known drive is mounted when it is plugged in. Check that `ludexis-edge status` lists it under `Drives`; if it does not, mount it below `/media`, `/mnt` or `/run/media`, or a folder in `EDGE_ROOTS`.

The library stays offline, with all its games, until the drive is back.

## Windows: "Drive E: is not mapped into the edge device"

Docker Desktop only sees the drives that existed when it started, and the device only maps the letters of its libraries when `ludexis-edge restart` runs.

1. Run `ludexis-edge restart`. It mounts drives that appeared after Docker Desktop started and maps them.
2. If it warns that it could not make the drive visible to Docker Desktop, restart Docker Desktop with the drive connected, then run `ludexis-edge restart` again.

This also applies after unlocking an encrypted volume.

## Windows: a mapped network drive does not work

Mapped network drives are not visible to Docker Desktop, so the device cannot scan them. Libraries on an edge device must be on a drive attached to the machine.

## Windows: "is not a Windows path such as E:\Games"

The library's folder path on the server does not start with a drive letter. Edit the library under **Admin > Libraries** and enter the path as Windows shows it.

## Linux: "is outside the folders the edge device can see"

The device sees drives below `/media`, `/mnt` and `/run/media`. For a folder elsewhere:

1. Add its parent folder to `EDGE_ROOTS` in `/opt/ludexis-edge/.env`, separating several with `:`.
2. Run `sudo ludexis-edge restart`.

## A library says "folder not found"

The library has never been scanned, and its folder path does not exist on the device. Check the path on the server against the path on the machine; it must be written as that machine shows it, such as `/media/you/Games` or `E:\Games`.

## A scan waits and never starts

A scan of an edge library waits until its device checks in. Check that the device is online on **Admin > Edge**. The device runs one scan at a time, so other scans wait for the running one. A scan that waits for 7 days is marked failed.

## The device runs another release

**Admin > Edge** shows "Runs another release than the server: update it". Set `LUDEXIS_VERSION` in the device's `.env` to the server's release, or leave it at `latest` if the server follows `latest`, then run `ludexis-edge update`.
