const databaseDumpCommandWithOptions = [
    'mysqldump',
    'magento',
    '--skip-lock-tables',
    '--set-gtid-purged=OFF',
    '--single-transaction=TRUE',
    '--column-statistics=0',
    '--max_allowed_packet=1GB',
    '--no-tablespaces'
]

module.exports = databaseDumpCommandWithOptions
