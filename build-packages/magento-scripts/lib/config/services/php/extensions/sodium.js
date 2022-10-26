/**
 * @type {import('../../../../../typings/index').PHPExtensionInstallationInstruction}
 */
module.exports = {
    name: 'sodium',
    command: 'docker-php-ext-install sodium',
    dependencies: ['libsodium-dev']
}
