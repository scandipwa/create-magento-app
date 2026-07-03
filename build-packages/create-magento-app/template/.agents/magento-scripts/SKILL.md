---
name: magento-scripts
description: Run Magento, PHP, Composer, or SQL commands in a create-magento-app (magento-scripts) project — always via the `exec` package script into Docker, never on the host. Use when running bin/magento or composer, querying the MariaDB database, starting/stopping/checking the stack, importing a DB dump, or reading container logs.
---

# magento-scripts CLI

This project runs on Docker through **`@scandipwa/magento-scripts`** (create-magento-app). PHP, Composer, MariaDB, and the search engine live *inside containers* — nothing runs on the host. You never call the `magento-scripts` binary directly; every command is a **`package.json` script** you run through the project's package manager. You reach into a container with the **`exec`** script. That is the whole game.

## Package-manager routing

The wrapped scripts are `start`, `stop`, `status`, `exec`, `import-db`, `logs`, `cli`, `link`. Run one as `<pm> run <script>`, where `<pm>` is the project's manager. Passing arguments differs by manager — this is the one thing to get right:

| `<pm>` | Form with args | Rule |
|---|---|---|
| npm | `npm run exec -- php bin/magento cache:flush` | **needs `--`** before args; npm consumes that one `--` |
| pnpm | `pnpm run exec php bin/magento cache:flush` | use `run` — bare `pnpm exec` is a *different* command |
| yarn | `yarn exec php bin/magento cache:flush` | pass args bare, no `--` |
| bun | `bun run exec php bin/magento cache:flush` | pass args bare, no `--` |

Examples below write `<pm> run` — substitute your manager, and **on npm add the `--`** (e.g. `npm run exec -- php …`). Never add a *second* `--`; it becomes part of the command and the exec fails.

## Two rules that never change

- **Everything goes through `exec`.** `<pm> run exec <container> <command>`. Never run `php`, `composer`, or `bin/magento` on the host — the host has the wrong (or no) PHP. Never call `docker exec` directly either; `exec` resolves the right container name, user, and working directory for you.
- **You are non-interactive.** In a non-TTY terminal (agent, CI, pipe), magento-scripts detects it and switches to plain output with no prompts — you need no flag. Always give `exec` a command; never use the `cli` script (an interactive shell — it hangs without a TTY). Pass a non-interactive flag only to *force* the mode inside a real TTY: `exec -n`, `status -n`, `import-db -y` (on npm, `-- -n` etc.).

## Commands

Each is `<pm> run <script>`:

| Script | Does | Key flags |
|---|---|---|
| `start` | Build + start the Docker stack | `--skip-setup`/`-s`, `--port`/`-p`. ⚠ `-n`/`--open` means *open browser*, not non-interactive |
| `stop` | Stop all containers | |
| `status` | Container + DB status | `-n` plain text, `--verbose` add image/volume sizes (slower) |
| `exec <container> <cmd>` | Run a command in a container | `-n` force non-interactive |
| `import-db [file]` | Import a SQL dump into MariaDB | `-y` skip prompts, `--remote-db=ssh://user@host` |
| `logs <container>` | Stream logs | `--tail N`, `--follow` |
| `cli` | Interactive shell — TTY only, never in automation | |
| `link <path>` | Link a ScandiPWA theme | |

`cleanup` (remove cached/generated files) isn't wired as a script by default — add `"cleanup": "magento-scripts cleanup"` to `package.json` if you need it.

## Running Magento / Composer / PHP

```bash
<pm> run exec php bin/magento setup:upgrade      # npm: run exec -- php bin/magento setup:upgrade
<pm> run exec php composer install
<pm> run exec php bin/magento list               # discover available commands
```

**File paths are the host's absolute paths.** The project is bind-mounted into the `php`, `phpWithXdebug`, and `nginx` containers at the *same absolute path* as on the host — there is no `/var/www/html`. Pass an absolute host path or a path relative to the project root; both resolve.

## Querying the database

The database lives in the **`mariadb`** container; use the `mariadb` client (not `mysql`). Default credentials from `app/etc/env.php`: user `magento`, password `magento`, database `magento`.

```bash
<pm> run exec mariadb mariadb -u magento -pmagento magento -e "SELECT COUNT(*) FROM store"
```

For SQL variables, running `.sql` files (the `mariadb` container does *not* mount your project), and shell-escaping caveats, see [`DATABASE.md`](DATABASE.md).

## When to run what

- **Pulled `composer.json` / `composer.lock` changes** → `<pm> run exec php composer install`.
- **Changed `app/etc/config.php`, patches, or install/upgrade data scripts** → `<pm> run exec php bin/magento setup:upgrade`.
- **DI or generated code feels stale** → delete it: `rm -rf generated`. Dev mode regenerates on demand — faster than `setup:di:compile`, and no cache flush is needed after `setup:upgrade`.

## Warn before running

Rarely needed in a dev environment and slow enough to deserve a heads-up — flag the cost and confirm with the user before running:

- **`indexer:reindex`** — a full reindex is slow, and dev mode reindexes on save. Run only when the user explicitly asks.
- **`setup:di:compile`** — dev mode generates DI on demand; prefer `rm -rf generated` (above) to clear stale classes.
- **`cache:flush` / `cache:clean`** — usually unnecessary, including after `setup:upgrade`. Run only if a change genuinely isn't taking effect.
- **`setup:static-content:deploy`** — dev mode serves static content on demand; a full deploy is slow and seldom wanted.

## Landmines

- **Cannot run as root** — magento-scripts exits with code 1 immediately, no override.
- **`start` and `import-db` are slow** — a container build or large dump can take 10+ minutes. Set timeouts ≥ 600000 ms (10 min), or run without one.
- **`import-db` is self-contained** — it stops containers, assigns ports, starts services, waits for MariaDB, then imports. Do **not** run `start` before or between `import-db` attempts; running both fights over ports. Use one or the other.
- **`!` in SQL passed to `exec`** — the shell may expand it (e.g. `!=`). Use `<>` instead.
