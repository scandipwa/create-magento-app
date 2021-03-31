const dependenciesForPlatforms = {
    darwin: [
        'zlib',
        'bzip2',
        'libiconv',
        'libzip',
        'curl',
        'libpng',
        'gd',
        'freetype',
        'oniguruma',
        'icu4c',
        'libxml2'
    ],
    'Arch Linux': [
        'freetype2',
        'openssl',
        'oniguruma',
        'libxslt',
        'bzip2',
        ['libjpeg', 'libjpeg-turbo', 'libjpeg6-turbo'],
        'libpng',
        'icu',
        'libxml2',
        'autoconf',
        'libzip',
        'sqlite',
        'readline',
        'perl'
    ],
    Fedora: [
        'openssl-devel',
        'libjpeg-turbo-devel',
        'libpng-devel',
        'gd-devel',
        'libicu',
        'libicu-devel',
        'libzip-devel',
        'libtool-ltdl-devel',
        'oniguruma-devel'
    ],
    Ubuntu: [
        'libcurl4-openssl-dev',
        'libonig-dev',
        'libjpeg-dev',
        'libjpeg8-dev',
        'libjpeg-turbo8-dev',
        'libpng-dev',
        'libicu-dev',
        'libfreetype6-dev',
        'libzip-dev',
        'libssl-dev',
        'build-essential',
        'libbz2-dev',
        'libreadline-dev',
        'libsqlite3-dev',
        'libssl-dev',
        'libxml2-dev',
        ['libxslt-dev', 'libxslt1-dev'],
        'libonig-dev',
        'php-cli',
        'php-bz2',
        'pkg-config',
        'autoconf'
    ]
};

module.exports = dependenciesForPlatforms;
