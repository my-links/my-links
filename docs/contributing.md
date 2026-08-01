# Contributing

Thank you for considering contributing to MyLinks! We want the contribution process to be as smooth and transparent as possible.

## How to contribute

There are several ways to help:

- Reporting bugs
- Suggesting new features
- Improving the documentation
- Writing or improving tests
- Submitting code enhancements

## Bug reports and feature requests

Open an issue on [GitHub Issues](https://github.com/my-links/my-links/issues).

For a bug, include a clear description of the problem, steps to reproduce it, and any relevant log or error messages. For a feature request, describe the problem you are trying to solve and how the feature would help.

## Repository layout

MyLinks is a pnpm workspace:

| Path             | Package               | What it is                                                                  |
| ---------------- | --------------------- | --------------------------------------------------------------------------- |
| `apps/webapp`    | `@my-links/webapp`    | The AdonisJS + Inertia/React application, and the REST API it exposes       |
| `apps/extension` | `@my-links/extension` | The browser extension (WXT + React), targeting Chromium MV3 and Firefox MV2 |
| `docs/`          | —                     | This documentation site                                                     |

## Development setup

### Environment

Environment files, migrations and the `node ace` CLI all belong to `apps/webapp` — see [Configuration](/self-hosting/configuration) for the full list of variables.

```bash
cp apps/webapp/.env.example apps/webapp/.env
```

### Running with Docker

The recommended method uses Docker for the PostgreSQL database. Recipes are defined in the [`Justfile`](https://github.com/my-links/my-links/blob/main/Justfile) and run with [just](https://github.com/casey/just):

```bash
just dev
```

This starts a PostgreSQL container, resets the database and applies every migration, then starts the development server with hot reload.

### Running without Docker

If you prefer a locally installed PostgreSQL:

1. Make sure PostgreSQL is running, and configure `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` and `DB_DATABASE` in `apps/webapp/.env`.
2. Reset the database and apply migrations:

   ```bash
   cd apps/webapp && node ace migration:fresh
   ```

3. Start the development server:

   ```bash
   pnpm run dev:webapp
   ```

The server is reachable at `http://localhost:3333` (or the port set in your `.env`).

### Working on the extension

The extension needs a running webapp to talk to. With one started, from the repository root:

```bash
pnpm run dev:extension
```

See [`apps/extension/README.md`](https://github.com/my-links/my-links/blob/main/apps/extension/README.md) for side-loading, Firefox builds, generating API types, and the rest of the extension-specific workflow.

### Useful commands

Run from the repository root:

| Command                                 | What it does                                                |
| --------------------------------------- | ----------------------------------------------------------- |
| `just dev`                              | Database container + migrations + webapp dev server         |
| `just fresh`                            | Reset the database and re-run every migration               |
| `just seed`                             | Seed the database                                           |
| `just down`                             | Stop the dev and production containers                      |
| `just prod`                             | Run the production compose stack locally                    |
| `just extract` / `just compile`         | Extract and compile the i18n catalogs                       |
| `just test`                             | Dev stack + every suite, unit through browser               |
| `just release`                          | Cut a release — checks, then `just test`, then the build    |
| `pnpm run dev:webapp` / `dev:extension` | Dev server for one workspace                                |
| `pnpm run build`                        | Build every workspace                                       |
| `pnpm run test`                         | Webapp test suite (needs PostgreSQL on the configured host) |
| `pnpm run test:browser`                 | Browser suite for the auth journey — see below              |
| `pnpm run check`                        | Lint, format check and typecheck across the monorepo        |

`just test` brings the dev containers up and runs `migration:fresh` before the suites, so it **wipes whatever is in the development database**. That also applies to `just release`, which runs it. This is also what the [CI workflow](https://github.com/my-links/my-links/blob/main/.github/workflows/ci.yml) runs on every pull request and push to `main`.

### Browser test suite

Most of the test suite is functional: real HTTP requests against the app, no browser involved. One thing that isn't covered that way is the auth journey a person actually clicks through — form submission, redirects, and what a mailbox receives — so `apps/webapp/tests/browser/auth_journey.spec.ts` drives it with a real (headless) browser via Playwright, against mailpit for the mail it sends.

It needs two things a plain `pnpm run test` doesn't:

- **mailpit running** — `docker compose -f dev.compose.yml up -d mailpit`, or the full `just dev` stack.
- **A Chromium binary** — `npx playwright install chromium`, once per machine.

No separate build or dev server is required: `node ace test` boots the app the same way `node ace serve` does, embedded Vite dev middleware included, and serves real pages to the browser directly from source. If `apps/webapp/public/assets` exists from a previous `pnpm run build`, remove it first — its presence makes the app try to read a production manifest instead, which fails immediately.

With mailpit up and Chromium installed, `pnpm run test:browser` (webapp workspace) runs it. `pnpm run test` never includes it — the two suites are deliberately kept apart so a routine `pnpm run test` never needs mailpit or a browser.

## Pull requests

1. Fork the repository and create your branch from `main`.
2. Run `pnpm run check` (lint, format check and typecheck across the monorepo) and make sure it passes.
3. Add tests for new features or bug fixes, co-located with the code they cover.
4. Ensure existing tests still pass: `pnpm run test` for the webapp (needs PostgreSQL), and `pnpm --filter @my-links/extension run check` when touching the extension — it runs the suite against both the Chromium and Firefox targets. If your change touches the auth UI, also run `pnpm run test:browser` (see above) — it isn't part of `pnpm run test` and reviewers won't assume it ran otherwise.
5. Write commit messages in the imperative mood, one logical change per commit.
6. Clearly describe the purpose of your pull request, with relevant issue numbers if applicable.

Push your branch to your fork and submit a pull request against `main`. All contributions are reviewed by maintainers, who may request changes before merging.

## Community

Join our community discussions on [our Trello board](https://trello.com/b/CwxkMeZp/mylinks) to collaborate on ideas, issues, and features!

Thank you for helping make MyLinks better!
