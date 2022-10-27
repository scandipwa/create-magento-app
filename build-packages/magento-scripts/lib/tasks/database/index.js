module.exports = {
    connectToDatabase: require('./connect-to-database'),
    importDumpToDatabase: require('./import-dump-to-database'),
    fixDB: require('./fix-db'),
    dumpThemeConfig: require('./dump-theme-config'),
    restoreThemeConfig: require('./restore-theme-config')
}
