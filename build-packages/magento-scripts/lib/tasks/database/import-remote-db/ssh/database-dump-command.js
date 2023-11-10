const databaseDumpCommandWithOptions = [
    'mysqldump',
    'magento',
    '--skip-lock-tables',
    '--single-transaction=TRUE',
    '--max_allowed_packet=1GB',
    '--no-tablespaces'
]

module.exports = databaseDumpCommandWithOptions
