/**
 * @type {import('../../../../../typings/index').PHPExtensionInstallationInstruction}
 */
module.exports = {
    name: 'gd',
    command:
        'docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp && docker-php-ext-install gd',
    dependencies: [
        'freetype-dev',
        'libjpeg-turbo-dev',
        'libpng-dev',
        'zlib-dev',
        'libwebp-dev'
    ]
}
