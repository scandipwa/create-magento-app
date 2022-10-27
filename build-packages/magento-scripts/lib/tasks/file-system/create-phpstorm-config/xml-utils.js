const formatPathForPHPStormConfig = (p) =>
    p.replace(process.cwd(), '$PROJECT_DIR$')

module.exports = {
    formatPathForPHPStormConfig
}
