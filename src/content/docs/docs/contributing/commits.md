---
title: Commits and pull requests
description: The commit message format, the branch and pull request flow, and how submodule updates reach the main repository.
---

These rules come from the [contributing guide](https://github.com/Ludexis/.github/blob/main/CONTRIBUTING.md) of the Ludexis organization, which applies to all three repositories.

## Where to open it

Open issues and pull requests in the repository where the change lives:

| Change | Repository |
| --- | --- |
| API, scanner, metadata, jobs, database | [ludexis-backend](https://github.com/Ludexis/ludexis-backend) |
| Web app, pages, components | [ludexis-frontend](https://github.com/Ludexis/ludexis-frontend) |
| Docker Compose, deployment, documentation | [Ludexis](https://github.com/Ludexis/Ludexis) |

A change that touches both the API and the web app needs a pull request in each repository.

## Commit messages

Write commit messages as [Conventional Commits](https://www.conventionalcommits.org/):

```text
type(scope): description
```

For example:

```text
fix(scanner): skip unreadable folders
feat(edge): count new or resized files on automatic scans instead of hashing them
docs(readme): describe the ludexis command
```

Keep the description short, in the imperative, and about what the change does.

| Type | Use it for |
| --- | --- |
| `feat` | A new feature |
| `fix` | A bug fix |
| `perf` | A change that makes something faster or lighter |
| `refactor` | A code change that neither fixes a bug nor adds a feature |
| `test` | Adding or correcting tests |
| `docs` | Documentation only |
| `build` | The build, images, Compose files or dependencies |
| `ci` | GitHub Actions workflows and Dependabot |
| `chore` | Maintenance, such as `.gitignore` or release commits |

The scope names the area: for example `scan`, `metadata`, `artwork`, `edge`, `jobs`, `versions`, `admin`, `compose`, `readme` or `release`.

## Pull requests

1. Fork the repository and branch from `main`.
2. Keep the change focused: one fix or feature per pull request.
3. Add or update tests for what you change.
4. Run the checks before pushing:
   - backend: `pytest`
   - frontend: `npm run lint`, `npx tsc --noEmit` and `npm test`
5. Write the commits as described above.
6. Open the pull request. Describe what changed and why, with screenshots for visible changes.

CI runs the same checks on every pull request. See [Tests and CI](/docs/contributing/testing/). Database changes need an Alembic migration; see [Backend](/docs/contributing/backend/).

### Code style

Follow the style of the surrounding code. In the backend: typed Python, business logic in `app/services`, queries in `app/repositories`. In the frontend: TypeScript, Tailwind, and the shared primitives from `components/ui`.

## Reporting a bug

Include what you did, what you expected, what happened instead, your Ludexis version (the image tag) and the relevant logs, for example from `docker compose logs backend worker`. Leave out passwords, API keys and private paths.

## Submodule updates

The main repository pins one commit of `backend/` and one of `frontend/`. Dependabot keeps those pins current. Its configuration in `.github/dependabot.yml` uses the `gitsubmodule` ecosystem and checks every 10 minutes:

- When `ludexis-backend` or `ludexis-frontend` has new commits on `main`, Dependabot opens a pull request in the main repository that moves the submodule to the new commit.
- Its commit messages use the `chore` prefix with a scope, so they follow the same convention.
- Merging that pull request is how a merged change in a sub-repository reaches the main repository.

When you check out a newer main repository, update your submodules to the commits it pins:

```bash
git pull
git submodule update --init
```

## License

By contributing you agree that your contributions are released under the MIT License.
