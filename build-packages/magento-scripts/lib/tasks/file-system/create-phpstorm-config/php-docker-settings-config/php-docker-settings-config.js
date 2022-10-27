const path = require('path')

const getPhpDockerSettingsConfig = () => ({
    path: path.join(process.cwd(), '.idea', 'php-docker-settings.xml')
})

module.exports = {
    getPhpDockerSettingsConfig
}
