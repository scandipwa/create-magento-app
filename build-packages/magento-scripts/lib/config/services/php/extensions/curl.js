/**
 * @type {import('../../../../../typings/index').PHPExtensionInstallationInstruction}
 */
module.exports = {
    name: 'curl',
    command: 'docker-php-ext-install curl',
    dependencies: ['curl-dev', 'libcurl']
}
