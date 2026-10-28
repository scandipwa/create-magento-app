/**
 * sed -E script that removes DEFINER clauses from a mysqldump / mariadb-dump
 * file, so triggers, views, routines and events are created with the importing
 * user as definer.
 *
 * Production dumps name definers that don't exist locally, so importing them
 * succeeds but every later write to a table with such a trigger (and every read
 * of such a view) fails with ERROR 1449.
 *
 * Matches the backtick-quoted form the dump tools emit, including doubled
 * backticks inside names and host-less MariaDB role definers. Only lines that
 * start with a versioned comment or CREATE are edited: that is where the dump
 * tools put definers, while row data lives on INSERT / REPLACE lines or, since
 * mariadb-dump 10.11, on their own lines starting with "(".
 */
const stripDefinersSedScript =
    '/^(\\/\\*!|CREATE )/s/DEFINER=`([^`]|``)*`(@`([^`]|``)*`)?//g'

module.exports = {
    stripDefinersSedScript
}
