---
title: Windows
description: Install an edge device on Windows with install.ps1, and how it sees drive letters through Docker Desktop.
---

## Install

You need [Docker Desktop](https://docs.docker.com/desktop/setup/install/windows-install/), installed and started at least once, and the `ludexis-edge-windows.zip` file from **Admin > Edge** (see [Adding an edge device](/docs/edge/overview/#adding-an-edge-device)).

1. Unzip `ludexis-edge-windows.zip`.
2. Open PowerShell in the `ludexis-edge` folder it created.
3. Run the installer:

   ```powershell
   powershell -ExecutionPolicy Bypass -File install.ps1
   ```

The installer works for your Windows account only and needs no administrator rights. It:

- copies the device to `%LOCALAPPDATA%\Ludexis\edge`;
- puts the `ludexis-edge` command in `%LOCALAPPDATA%\Ludexis\bin` and adds that folder to your PATH;
- writes this computer's name into `EDGE_HOSTNAME` in `.env`;
- starts the device, and Docker Desktop too if it is not running.

Open a new terminal afterwards, so the `ludexis-edge` command is found.

## Add a library

On the server, add a library under **Admin > Libraries** with this device as its **Location** and the folder path as Windows shows it, such as `E:\Games`. Then, on the device:

```powershell
ludexis-edge restart
```

The device only sees the drive letters that hold one of its libraries, and `restart` is what maps them into its container. It prints a line for each library, such as `Library    Games (E:\Games): drive E: found`, followed by the device's status.

## Drive letters and serial numbers

After the first scan, a library is tied to its drive's volume serial number, not to its letter. If the drive comes back as `F:` instead of `E:`, `ludexis-edge restart` finds it by its serial and maps the new letter. Linux and Windows report an NTFS drive's serial differently but agree on its last eight hex digits, which is what Ludexis compares, so the drive is recognised under either system.

## Plugging drives in later

Docker Desktop's virtual machine only sees the drives that existed when it started. A USB drive plugged in later, or an encrypted volume unlocked later, would appear to the device as an empty folder.

After plugging a drive in or unlocking it, run:

```powershell
ludexis-edge restart
```

It mounts the late drive into Docker Desktop's virtual machine itself, then maps it into the container. If that fails, it prints a warning that it could not make the drive visible to Docker Desktop; then restart Docker Desktop with the drive connected and run `ludexis-edge restart` again.

:::caution
Mapped network drives are not visible to Docker Desktop, so an edge library cannot live on one. Use a drive attached to the machine.
:::

## Where things are

| Path | Contents |
| --- | --- |
| `%LOCALAPPDATA%\Ludexis\edge\.env` | The device's settings and token |
| `%LOCALAPPDATA%\Ludexis\edge\docker-compose.yml` | The device container |
| `%LOCALAPPDATA%\Ludexis\edge\docker-compose.override.yml` | The drive letters mapped into the container, rewritten by `ludexis-edge restart`; do not edit it |
| `%LOCALAPPDATA%\Ludexis\edge\state\` | The drive serials and libraries the device last saw |
| `%LOCALAPPDATA%\Ludexis\bin\ludexis-edge.cmd` | The `ludexis-edge` command |

Inside the container, each mapped drive is mounted read-only at `/drives/<letter>`. The device never writes to your drives.

The container starts again with Docker Desktop, so after a reboot the device comes back once Docker Desktop is running, unless you stopped it with `ludexis-edge stop`. See [The ludexis-edge command](/docs/edge/commands/) for the other commands.
