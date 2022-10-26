/**
 * @type {import('../../../../../typings/index').PHPExtensionInstallationInstruction}
 */
module.exports = {
    name: 'intl',
    command: 'docker-php-ext-install intl',
    dependencies: ['icu-dev']
}
