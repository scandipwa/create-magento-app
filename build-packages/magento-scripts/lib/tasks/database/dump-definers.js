/**
 * sed -E script that removes DEFINER clauses from a mysqldump / mariadb-dump
 * file, so triggers, views, routines and events are created with the importing
 * user as definer.
 *
 * Production dumps name definers that don't exist locally. Importing them as a
 * user without SUPER aborts the import (ERROR 1227); importing as root succeeds
 * but every write to a table with such a trigger later fails (ERROR 1449).
 *
 * Matches the backtick-quoted form the dump tools emit, including doubled
 * backticks inside names and host-less MariaDB role definers. INSERT lines are
 * skipped so row data that happens to contain "DEFINER=" is left alone.
 */
const stripDefinersSedScript =
    '/^INSERT INTO /!s/DEFINER=`([^`]|``)*`(@`([^`]|``)*`)?//g'

module.exports = {
    stripDefinersSedScript
}
