---
title: Jobs and schedules
description: Background jobs, the scheduled tasks and their defaults, retries, and cancelling a job.
---

Scans, metadata lookups and artwork downloads run as background jobs in the worker, so the web app stays responsive while they work. Every job is recorded with its progress and result.

## Kinds of job

| Job | What it does |
| --- | --- |
| **Scan for changes** | Reads new and changed files in the libraries. See [Libraries and scans](/docs/using/libraries/). |
| **Full library scan** | Goes through every file of the libraries again. |
| **Refresh metadata** | Refreshes matched games from their sources and matches games never searched. Scans start one for the games they add. |
| **Download artwork** | Validates stored artwork and downloads what is missing or broken. |
| **Find duplicates** | Groups files with the same content, for the **Duplicates** tab under **Admin > Metadata**. |
| **Verify files** | Hashes every file of the server's libraries again and marks each game **File verified**, **File missing** or **File corrupted**. |

**Verify files** skips libraries that are offline, so an unplugged drive never makes its games look missing, and libraries on edge devices, whose drives the server cannot see.

## The Jobs tab

**Admin > Tasks > Jobs** lists every job, newest first, with its status, details and progress. Filter it by status (**Running**, **Queued**, **Done**, **Failed**, **Canceled**) or by kind of job. The list updates every few seconds while a job is active, and running jobs also show in the top bar.

**Start job** runs any kind of job now.

**Cancel** on a running or queued job asks for confirmation, then stops it at its next step. What the job already stored is kept. A scan of an edge device stops when the device next reports its progress.

This tab needs the **Run scans** permission.

## Retries and stuck jobs

A job that fails with an error is retried automatically, up to 5 times, with a growing wait of at most 5 minutes between tries. The row shows how often it was retried. `JOB_MAX_RETRIES` and `JOB_RETRY_BACKOFF_MAX` change both limits; see [Configuration](/docs/start/configuration/#redis-and-the-job-queue).

A job whose worker stopped is marked **Failed** instead of showing as running forever: when the worker restarts, after 12 hours of running, or after 24 hours queued without a worker picking it up. Edge scans have their own limits: a queued one waits up to 7 days for its device, and a running one fails when its device has not checked in for an hour.

## Scheduled tasks

**Admin > Tasks > Scheduled** lists the recurring tasks. Each can be switched on or off, set to run every day or on one day of the week, and given a time. **Run now** starts it at once.

| Task | Job | Default |
| --- | --- | --- |
| **Scan libraries** | Scan for changes | Every day at 02:00 |
| **Refresh metadata** | Refresh metadata | Every day at 03:00 |
| **Validate artwork** | Download artwork | Every day at 04:00 |
| **Verify archive integrity** | Verify files | Every Sunday at 05:00 |
| **Detect duplicates** | Find duplicates | Every Sunday at 05:30 |

Times are in the server's time zone, set by `TZ` in `.env`. The table also shows each task's last run, its result and its next run.

The scheduler checks every five minutes for tasks that are due, so a task can start up to five minutes after its time. A task whose kind of job is already queued or running on the server waits for the next check instead of starting a second copy. On a new install the clock starts at the first start, so the tasks do not all run at once.

:::note
Scheduled scans read no files: they only count new or resized files, and the Libraries page then asks whether to check them. See [automatic scans](/docs/using/libraries/#automatic-scans-and-the-pending-changes-prompt).
:::

The Scheduled tab needs both **Run scans** and **Access admin**.
