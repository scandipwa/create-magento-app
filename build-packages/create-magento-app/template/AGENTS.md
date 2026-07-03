# CMA (magento-scripts) — AI/CI Reference

> Shipped with your project by create-magento-app.
>
> Commands run through your package manager (`<pm> run <script>`). Deeper reference — per-manager arg rules, DB query patterns, when-to-run heuristics — is in the `magento-scripts` agent skill.

## Critical

- **Everything runs via `<pm> run`** — `magento-scripts` is never called directly; use the `package.json` scripts through npm / yarn / pnpm / bun. Pass args after the script name; **npm needs one `--`** (`npm run exec -- php bin/magento cache:flush`), yarn / pnpm / bun don't. Never add a second `--`.
- **Cannot run as root** — exits immediately with code 1, no override.
- **Non-TTY safe** — silent renderer activates automatically in CI/pipes; no `-q` needed.
- **`cli` is TTY-only** — use `<pm> run exec php bin/magento <cmd>` in automation instead.
- **`import-db` is self-contained** — it stops running containers, assigns ports, starts services, waits for MariaDB, and imports. Do NOT run `start` before or between `import-db` attempts — that creates port conflicts. Just run `import-db` directly.
- **Long-running commands** — `start` and `import-db` can take 10+ minutes (container setup, large dumps). Set timeouts to at least 600000ms (10 min) or run without a timeout.
- **Shell escaping** — Avoid `!` in SQL strings passed via `exec` (e.g., `!=`), as the shell may interpret it. Use `<>` instead.

## Commands

Each runs as `<pm> run <script>`:

| Script | What it does | Key flags |
|--------|-------------|-----------|
| `start` | Start Docker environment | `--skip-setup`, `--port`. ⚠ `-n`/`--open` = open browser, not non-interactive |
| `stop` | Stop all containers | — |
| `status` | Show container/DB status | `-n` (plain text), `--verbose` (image/volume sizes) |
| `exec <container> [cmd...]` | Run command in container | `-n` forces non-interactive |
| `import-db [file]` | Import SQL dump into MariaDB | `-y` (skip prompts), `--remote-db=ssh://user@host` |
| `logs <container>` | Stream container logs | `--tail N`, `--follow` |
| `cli` | Interactive shell (TTY only) | — |
| `link <path>` | Link ScandiPWA theme | — |

`cleanup` (remove cached/generated files) isn't a script by default — add `"cleanup": "magento-scripts cleanup"` to `package.json` if you need it.

## Containers

`php`, `phpWithXdebug`, `nginx`, `sslTerminator`, `redis`, `mariadb`, `elasticsearch`, `maildev`, `varnish` (if enabled)

## Examples

```bash
# npm shown; on yarn / pnpm / bun, drop the `--`
npm run start -- --skip-setup
npm run import-db -- dump.sql -y
npm run import-db -- -y --remote-db=ssh://user@host
npm run exec -- php bin/magento setup:upgrade
npm run exec -- php bin/magento cache:flush

# Query MariaDB (use the mariadb client, not mysql)
npm run exec -- mariadb mariadb -u magento -pmagento magento -e "SELECT COUNT(*) FROM store"
npm run logs -- php --tail 100
npm run stop
```
