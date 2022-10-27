/**
 * @type {import('../../../../../typings/index').PHPExtensionInstallationInstruction}
 */
module.exports = {
    name: 'xsl',
    command: 'docker-php-ext-install xsl',
    dependencies: ['libxslt-dev']
}
