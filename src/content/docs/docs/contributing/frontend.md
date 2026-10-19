---
title: Frontend
description: The layout of ludexis-frontend, its API client, components, styling tokens and tests.
---

The web app is a Next.js 16 App Router project with React 19, TypeScript 5 and Tailwind CSS 4. It builds to a standalone Next.js server. Set it up first as described in [Repositories and setup](/docs/contributing/setup/).

## Project layout

```text
app/              App Router pages: (app) for the signed-in app, (auth) for sign-in and setup
components/
  ui/             shared primitives (buttons, dialogs, menus, inputs)
  game/           game page: hero, details and marks
  library/        library filters and query parameters
  browse/         game grid, collections, franchises, developers, publishers and tags
  admin/          admin dashboard: users, roles, jobs, schedules, duplicates, settings
  shell/          layout, navigation, command palette and job indicator
  media/, brand/, common/
contexts/         authentication state and confirmations
hooks/            data fetching and route protection
lib/              API clients, types, permissions, media URLs and formatting
e2e/              Playwright tests
```

The `(app)` route group holds the library, game pages (`archive/`), collections, franchises, developers, publishers, tags, favourites, account and admin pages. The `(auth)` group holds sign-in and first-run setup. Old addresses of merged pages are redirected in `next.config.mjs`.

## The API client

All requests go through `apiClient` in `lib/api/client.ts`:

| Method | Returns |
| --- | --- |
| `get`, `post`, `patch`, `put`, `delete` | The parsed JSON body, or nothing for a 204 |
| `getList` | `{ items, total }`, with `total` read from the `X-Total-Count` header |
| `postBlob` | A `Blob`, for files the server builds such as an edge bundle |

The client:

- prefixes every path with `config.apiBaseUrl`, from `NEXT_PUBLIC_API_URL` (see `lib/config.ts`);
- sends cookies with `credentials: "include"`, and adds the `X-Requested-With: ludexis` header the backend requires on cookie-authenticated writes;
- on a 401, calls `/auth/refresh` once, shared by all requests waiting at that moment, and repeats the request; when the refresh fails, it ends the session;
- retries a `GET` up to two times on 502, 503 or 504, with a growing delay;
- throws an `ApiError` carrying the status and the backend's `detail` message.

Each resource has its own module in `lib/api/`, such as `tags.ts` with `tagsApi.getAll`, `getById`, `create`, `update` and `delete`. `lib/api.ts` re-exports them all, and the request and response types live in `lib/types/`. To call a new endpoint, add a method to the matching module and its types to `lib/types/`.

In components, `useApi(load, deps)` from `hooks/use-api.ts` runs a loader when its dependencies change and returns `data`, `error`, `loading`, `reload` and `setData`. It ignores responses that arrive after a newer request.

## Components

- `components/ui/` holds the shared primitives: badge, button, card, checkbox, dialog, dropdown menu, input, label, progress, select, sheet, skeleton, switch, table, tabs and textarea. They follow the shadcn/ui "new-york" style (`components.json`), built on Radix UI with `class-variance-authority` for variants. Use them before writing a new control.
- `cn()` in `lib/utils.ts` joins class names and resolves Tailwind conflicts with `tailwind-merge`.
- Icons come from `lucide-react`. Toasts use `sonner`, through `lib/toast.ts`.
- Images are plain `<img>` elements: artwork comes from the API's `/media`, and the build sets `images.unoptimized`.

## Styling tokens

Colours are CSS variables on `:root` in `app/globals.css`, exposed to Tailwind through `@theme inline`. Use the token classes, such as `bg-stone`, `text-parchment` or `border-seam`, rather than raw colours.

| Token | Value | Use |
| --- | --- | --- |
| `night` | `#09080d` | Page background |
| `vault` | `#121019` | Cards |
| `stone` | `#1b1825` | Popovers, inputs, muted surfaces |
| `seam` | `#2b2738` | Borders |
| `parchment` | `#ece5d6` | Text |
| `ash` | `#958fa5` | Muted text |
| `violet` | `#5b35a3` | Primary actions |
| `violet-lit` | `#a284f2` | Focus rings and highlights |
| `spark` | `#e3a83b` | Kept rare: the matched-metadata mark, the active navigation pip and confidence fills |
| `moss` | `#7fb069` | Healthy states, verified files and completed marks |
| `ember` | `#d1604d` | Destructive actions and errors |

The shadcn names (`background`, `card`, `primary`, `muted`, `destructive`, `border`, `ring` and so on) map onto these tokens. Layout variables cover the sidebar width, top bar height and page gutter. The fonts are Hanken Grotesk (`font-sans`) and Cinzel (`font-display`), loaded with `next/font`.

## Tests

Unit and component tests use Vitest with React Testing Library and sit next to the code they cover, as `*.test.ts` or `*.test.tsx`.

| Setting (`vitest.config.ts`) | Value |
| --- | --- |
| Environment | `jsdom` |
| Included | `lib`, `components`, `hooks` and `app`, files ending in `.test.ts` or `.test.tsx` |
| Setup file | `vitest.setup.ts`: `jest-dom` matchers and stubs for browser APIs jsdom lacks |
| Test timeout | 20 seconds |
| Mocks | Restored and cleared after each test |
| Path alias | `@` points at the project root |

```bash
npm test               # run once
npm run test:watch     # re-run on changes
```

Playwright end-to-end tests are in `e2e/`. `npm run test:e2e` starts the dev server on port 3001, or reuses one already running, and runs them in Chromium, Firefox and WebKit; the visual tests run in Chromium only. They sign in to a running backend and are not part of CI.

Linting uses ESLint 9 with `eslint-config-next`'s Core Web Vitals rules, configured in `eslint.config.mjs`. See [Tests and CI](/docs/contributing/testing/) for everything CI runs.
