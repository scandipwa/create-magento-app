/**
 * @type {import('../../../../../typings/index').PHPExtensionInstallationInstruction}
 */
module.exports = {
    name: 'zip',
    command: 'docker-php-ext-install zip',
    dependencies: ['libzip-dev']
}
