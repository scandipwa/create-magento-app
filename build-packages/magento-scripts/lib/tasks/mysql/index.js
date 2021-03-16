module.exports = {
    connectToMySQL: require('./connect-to-mysql'),
    importDumpToMySQL: require('./import-dump-to-mysql'),
    fixDB: require('./fix-db'),
    dumpThemeConfig: require('./dump-theme-config'),
    restoreThemeConfig: require('./restore-theme-config')
};
