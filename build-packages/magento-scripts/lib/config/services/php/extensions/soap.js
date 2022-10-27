/**
 * @type {import('../../../../../typings/index').PHPExtensionInstallationInstruction}
 */
module.exports = {
    name: 'soap',
    command: 'docker-php-ext-install soap',
    dependencies: ['libxml2-dev']
}
