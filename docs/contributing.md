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

## Development setup

### Toolchain

Node.js and pnpm versions are pinned in `mise.toml` at the repository root. With [mise](https://mise.jdx.dev) installed, `mise install` sets them up, and mise activates them automatically inside the repository.

```bash
mise install
pnpm install
```

### Environment

Copy the template to `.env` at the repository root, where Docker Compose and every `just` recipe read it. See [Configuration](/self-hosting/configuration) for the variables, and for the `ENV_PATH` prefix a bare `node ace` run needs outside `just`.

```bash
cp .env.example .env
```

### Running with Docker

The recommended method uses Docker for the PostgreSQL database. Recipes are defined in the [`Justfile`](https://github.com/my-links/my-links/blob/main/Justfile) and run with [just](https://github.com/casey/just):

```bash
just dev
```

This starts a PostgreSQL container, resets the database and applies every migration, then starts the development server with hot reload.

### Running without Docker

If you prefer a locally installed PostgreSQL:

1. Make sure PostgreSQL is running, and configure `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` and `DB_DATABASE` in the root `.env`.
2. Reset the database and apply migrations:

   ```bash
   cd apps/webapp && ENV_PATH=../.. node ace migration:fresh
   ```

3. Start the development server, from the repository root:

   ```bash
   ENV_PATH=../.. pnpm run dev:webapp
   ```

The server is reachable at `http://localhost:3333` (or the port set in your `.env`).

### Working on the extension

The extension needs a running webapp to talk to. With one started, from the repository root:

```bash
pnpm run dev:extension
```

See [`apps/extension/README.md`](https://github.com/my-links/my-links/blob/main/apps/extension/README.md) for side-loading, Firefox builds, generating API types, and the rest of the extension-specific workflow.

### Commands

Run `just --list` for every recipe, and see the scripts in the root [`package.json`](https://github.com/my-links/my-links/blob/main/package.json). Before opening a pull request, run:

```bash
pnpm run check && just test
```

`just test` brings the dev containers up and runs `migration:fresh` before the suites, so it **wipes whatever is in the development database**. The [CI workflow](https://github.com/my-links/my-links/blob/main/.github/workflows/ci.yml) does not call it: on every pull request and push to `main` it runs `pnpm run check`, then `pnpm run test` and `pnpm run test:browser` against a fresh database of its own.

`just release` does not run the tests and leaves the development database alone. release-it first runs `pnpm run check`, `pnpm run build` and `just build-image`, so a broken check, build or Dockerfile fails before the tag and the release exist.

### Browser test suite

Most of the test suite is functional: real HTTP requests against the app, no browser involved. What a person actually clicks through is covered by the specs in `apps/webapp/tests/browser`, which drive a real (headless) browser with Playwright, against mailpit for the mail the app sends: registration with mail confirmation, account deletion and reactivation, the admin accounts table, collection visibility changes and their confirmations, and drag-and-drop reordering on the dashboard.

It needs two things a plain `pnpm run test` doesn't:

- **mailpit running**: `docker compose -f dev.compose.yml up -d mailpit`, or the full `just dev` stack.
- **A Chromium binary**: `npx playwright install chromium`, once per machine.

No separate build or dev server is required: `node ace test` boots the app the same way `node ace serve` does, embedded Vite dev middleware included, and serves real pages to the browser directly from source. If `apps/webapp/public/assets` exists from a previous `pnpm run build`, remove it first: its presence makes the app try to read a production manifest instead, which fails immediately.

With mailpit up and Chromium installed, `pnpm --filter @my-links/webapp run test:browser` runs the suite. `pnpm run test` never includes it; the two suites are deliberately kept apart so a routine `pnpm run test` never needs mailpit or a browser.

## Pull requests

1. Fork the repository and create your branch from `main`.
2. Run `pnpm run check` (lint, format check and typecheck across the monorepo) and make sure it passes.
3. Add tests for new features or bug fixes, co-located with the code they cover.
4. Ensure existing tests still pass: `pnpm run test` for the webapp (needs PostgreSQL), and `pnpm --filter @my-links/extension run check` when touching the extension (it runs the suite against both the Chromium and Firefox targets). If your change touches a flow the browser specs cover, also run `pnpm --filter @my-links/webapp run test:browser` (see above): it isn't part of `pnpm run test` and reviewers won't assume it ran otherwise.
5. Write commit messages in the imperative mood, one logical change per commit.
6. Clearly describe the purpose of your pull request, with relevant issue numbers if applicable.

Push your branch to your fork and submit a pull request against `main`. All contributions are reviewed by maintainers, who may request changes before merging.

Thank you for helping make MyLinks better!
