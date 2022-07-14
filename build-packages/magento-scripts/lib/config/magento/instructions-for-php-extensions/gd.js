module.exports = {
    name: 'gd',
    command: 'docker-php-ext-configure gd --with-freetype --with-jpeg && docker-php-ext-install -j$(nproc) gd',
    dependencies: [
        'freetype-dev',
        'libjpeg-turbo-dev',
        'libpng-dev'
    ]
};
