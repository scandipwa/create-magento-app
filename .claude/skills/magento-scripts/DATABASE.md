# Querying MariaDB via `exec`

Reached from [`SKILL.md`](SKILL.md). Run SQL against the **`mariadb`** container with the `mariadb` client. Default credentials from `app/etc/env.php`: user `magento`, password `magento`, database `magento`.

Examples write `<pm> run` — substitute the project's manager, and **on npm add `--`** after the script (`npm run exec -- mariadb …`).

```bash
<pm> run exec mariadb mariadb -u magento -pmagento magento -e "SELECT COUNT(*) FROM store"
```

## Escaping

- Wrap the `-e` value in **double quotes**, and SQL string literals in **single quotes**:
  ```bash
  <pm> run exec mariadb mariadb -u magento -pmagento magento -e "SELECT * FROM core_config_data WHERE path = 'web/secure/base_url'"
  ```
- Don't reach for `\047` or other escape sequences — the shell mangles them.
- Avoid `!` (e.g. `!=`); the shell may expand it. Use `<>`.

## Variables need one `-e`

MySQL session variables (`SET @x = …`) and `LAST_INSERT_ID()` live only for one client invocation. Put every dependent statement in a **single** `-e`, separated by `;`:

```bash
<pm> run exec mariadb mariadb -u magento -pmagento magento -e "SET @id = 42; INSERT INTO catalog_product_entity (sku, type_id) SELECT CONCAT(sku,'-copy'), type_id FROM catalog_product_entity WHERE entity_id = @id; SELECT LAST_INSERT_ID();"
```

Split across two `-e` calls, `@id` is undefined in the second.

## Running a `.sql` file

The **`mariadb` container does not mount your project** (only `php`, `phpWithXdebug`, and `nginx` do), so a file path won't resolve inside it. Pipe the file in from the host instead:

```bash
cat migration.sql | <pm> run exec mariadb mariadb -u magento -pmagento magento
```

Use `sh -c` inside the container only when you need shell features there (pipes, redirects, command substitution):

```bash
<pm> run exec mariadb sh -c 'mariadb -u magento -pmagento magento -e "SHOW TABLES" | wc -l'
```
