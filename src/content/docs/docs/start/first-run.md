---
title: First sign-in and setup
description: The setup screen, the default administrator, recovering a lost password and the JWT secret.
---

## The default administrator

On its first start, with an empty database, the backend creates one administrator: `admin` with the password `admin`, unless `DEFAULT_ADMIN_USERNAME` and `DEFAULT_ADMIN_PASSWORD` say otherwise. It also creates the built-in roles described in [Users, roles and access](/docs/using/users/).

To start with other credentials, set both in `.env` before the first `docker compose up -d`:

```env title=".env"
DEFAULT_ADMIN_USERNAME=alex
DEFAULT_ADMIN_PASSWORD=a-long-temporary-password
```

Whatever you choose, the account has to pick a new password at its first sign-in. Until it does, the sign-in page shows the account's name, and the API answers every other request from it with `403 Change the default password first`.

## The setup screen

Open `http://<host>:8420` and sign in with the default account. Ludexis opens the setup screen, which has three steps.

1. **Account.** Choose the username, email address and a new password of at least 8 characters.
2. **Library.** Name the first library (`Main Library` by default) and give its folder as the server sees it. With the Docker stack that is `/games`, the folder `GAMES_PATH` points to. Optionally enter an IGDB client ID and secret; VNDB and Steam work without keys.
3. **Review.** Check the summary and choose **Finish setup**.

Finishing changes the password, saves the account details, adds the library, stores the IGDB credentials if you gave them, and starts a full scan. The first scan of a large folder can take a while, because every archive is hashed once. Metadata and artwork for the new games are fetched by a job that starts when the scan is done.

Changing the password signs out every other session of that account.

:::tip
You can add the IGDB credentials later under **Admin > Settings**, and more libraries under **Admin > Libraries**.
:::

## A lost password

If another administrator can still sign in, they open **Admin > Users**, choose the account's menu and **Reset password**, and tell the user the new password. The user can change it on their account page.

If nobody can sign in, reset the account on the server, from the folder that holds `docker-compose.yml`:

```bash
docker compose exec backend python -m scripts.reset_password <username>
```

This sets the account's password to the default administrator password (`DEFAULT_ADMIN_PASSWORD`, `admin` unless set), reactivates the account if it was deactivated, and ends all its sessions. At the next sign-in it has to choose a new password, just like the first time. See [Command-line tools](/docs/advanced/cli/).

## The JWT secret

Sign-in tokens are signed with a secret. You do not need to set one: on first start Ludexis generates a random secret and stores it in `/data/config/jwt_secret` on the `ludexis_data` volume, where the backend, worker and scheduler all read it.

To manage it yourself, set `JWT_SECRET_KEY` in `.env`. It must be at least 32 characters long, or the backend refuses to start:

```bash
openssl rand -hex 32
```

Changing the secret, or losing the data volume without a backup, makes every existing token invalid, so everyone has to sign in again. [Updating and backups](/docs/start/updating/) shows how to back up the volume with the secret in it.
