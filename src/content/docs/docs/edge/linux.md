---
title: Linux
description: Install an edge device on Linux with install.sh, and how it mounts known drives when they are plugged in.
---

## Install

You need Docker Engine with the Compose plugin, a system with systemd and udev, and the `ludexis-edge-linux.zip` file from **Admin > Edge** (see [Adding an edge device](/docs/edge/overview/#adding-an-edge-device)).

```bash
unzip ludexis-edge-linux.zip && cd ludexis-edge
sudo ./install.sh
```

The installer:

- copies the device to `/opt/ludexis-edge` and writes this machine's name into `EDGE_HOSTNAME` in its `.env`;
- installs the `ludexis-edge` command in `/usr/local/bin`;
- installs a udev rule and the `ludexis-drive@.service` unit that mount known drives when they are plugged in;
- starts the device.

The `.env` holds the device's token and is readable by root only, so run `ludexis-edge` with `sudo`.

## Add a library

On the server, add a library under **Admin > Libraries** with this device as its **Location** and the folder path as this machine shows it, such as `/media/you/Games`. The device scans it at its next check-in.

The device sees drives mounted below `/media`, `/mnt` and `/run/media`, which is where desktops and most mount tools put them. It sees them read-only and never writes to them.

### Folders elsewhere

For a library folder outside those three, add its parent folder to `EDGE_ROOTS` in `/opt/ludexis-edge/.env`. Separate several folders with `:`:

```env title="/opt/ludexis-edge/.env"
EDGE_ROOTS=/srv/games:/data/archive
```

Then run `sudo ludexis-edge restart`. It mounts each folder read-only into the device container, through a `docker-compose.override.yml` it writes itself; edit `.env`, not that file.

## Drives by UUID

After the first scan, a library is tied to the UUID of the filesystem it is on, not to its mount point. If the drive is mounted somewhere else next time, for example under another user's `/media` folder, the device still finds the library on it. Linux and Windows report an NTFS drive's serial differently but agree on its last eight hex digits, which is what Ludexis compares, so the drive is recognised under either system.

## Plugging drives in

Once a library's drive is known, plugging it in is enough:

1. udev starts `ludexis-drive@<UUID>.service` for every filesystem that appears.
2. If the UUID belongs to one of the device's libraries, the helper waits a few seconds for the desktop to mount it. If nothing does, it mounts the drive read-only at `/mnt/ludexis/<UUID>`, tied to the device, so unplugging it unmounts it.
3. It starts the device if it is not running.
4. With **Autoscan** on, the server queues a scan of the libraries on that drive at the device's next check-in.

Drives that hold no library are left alone. The first scan of a new library needs its drive to be mounted already, by the desktop or by hand, below one of the folders the device sees.

See [How edge scans work](/docs/edge/scans/) for what an automatic scan does.

## Where things are

| Path | Contents |
| --- | --- |
| `/opt/ludexis-edge/.env` | The device's settings and token |
| `/opt/ludexis-edge/docker-compose.yml` | The device container |
| `/opt/ludexis-edge/state/` | The drives and libraries the device last saw, read by the mount helper |
| `/usr/local/bin/ludexis-edge` | The `ludexis-edge` command |
| `/usr/local/lib/ludexis-edge/ludexis-drive` | The mount helper |
| `/etc/systemd/system/ludexis-drive@.service` | The unit udev starts for a new drive |
| `/etc/udev/rules.d/99-ludexis-edge.rules` | The udev rule |
| `/mnt/ludexis/` | Where the helper mounts drives |

The container restarts with Docker, so the device comes back after a reboot unless you stopped it with `ludexis-edge stop`. See [The ludexis-edge command](/docs/edge/commands/) for the other commands.
