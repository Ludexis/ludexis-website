---
title: Users, roles and access
description: Add accounts, give them roles and permissions, and decide which games each account sees.
---

Everyone who uses Ludexis signs in with their own account. Any signed-in account can browse the library; roles decide what else it may do. Accounts are managed under **Admin > Users**, which needs the **Manage users** permission.

## Adding a user

Choose **Add user** and enter a username, an email address and a password of at least 8 characters. Pick the user's roles, or tick **Superuser** for an account that can do everything, whatever its roles say.

Each user's row has **Manage access** and a menu with:

| Action | Effect |
| --- | --- |
| **Change roles** | Pick the user's roles. |
| **Reset password** | Set a new password and tell it to the user; they can change it on their account page. |
| **Deactivate** / **Activate** | A deactivated account cannot sign in. Its data stays. |
| **Delete user** | Remove the account. |

You cannot deactivate or delete your own account from this page.

## Roles

Four roles exist from the first start:

| Role | Permissions |
| --- | --- |
| **Administrator** | All of them |
| **Moderator** | View library, Edit metadata, Manage collections, Run scans |
| **User** | View library |
| **ReadOnly** | View library |

The **Roles & permissions** tab lists them. **New role** creates your own role from any set of permissions, and existing roles can be edited or deleted. Users holding a deleted role lose its permissions.

Nobody can hand out, change or take away a permission they do not hold themselves. Superusers hold them all.

## Permissions

| Permission | What it allows |
| --- | --- |
| **View library** | Browsing. Every signed-in account can browse, so this permission adds nothing on its own. |
| **Edit metadata** | Identify, edit games and their artwork, delete games, and add or edit developers, publishers, franchises and tags. Opens **Admin > Metadata**. |
| **Manage collections** | Create, edit and delete collections, and add games to them. |
| **Run scans** | Start scans and jobs and cancel them. Opens **Admin > Tasks**, on its Jobs tab. |
| **Access admin** | Opens the Admin Dashboard, with **Libraries**, **Edge**, **Settings** and the scheduled tasks. |
| **Manage users** | Opens **Admin > Users**. |
| **View audit logs** | Opens **Admin > Activity log** and the History tab of each game. |

:::note
The Admin Dashboard opens only for accounts with **Access admin**. Inside it, each section also needs its own permission, so an account with **Access admin** but not **Manage users** does not see **Users**.
:::

## What each user sees

**Manage access** on a user's row decides which games that user sees. Under **Collections**, every collection is listed with a checkbox: the games of an unchecked collection are hidden from that user everywhere, in the library, on the home page, in search, in collections and on the browse pages. **All collections** checks or clears them all at once. New collections start checked.

## Your own account

The account page, from the user menu, lets each user change their password. Changing it signs out every other session. **Log out everywhere** ends every session of the account, including the current one, for example after signing in on a device you no longer trust.

Failed sign-ins are counted per username and address. After five failures within 15 minutes, further attempts are refused until those 15 minutes have passed.

## A lost password

If no administrator can sign in, the password can be reset on the server; see [First sign-in and setup](/docs/start/first-run/#a-lost-password).
