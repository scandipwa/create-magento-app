const dependenciesForPlatforms = {
    darwin: {
        dependencies: [
            'zlib',
            'bzip2',
            'libiconv',
            'libzip',
            'libsodium',
            'curl',
            'libpng',
            'gd',
            'freetype',
            'oniguruma',
            'icu4c',
            'libxml2'
        ],
        installCommand: (deps) => `brew install ${deps}`
    },
    'Arch Linux': {
        dependencies: [
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
            'perl',
            'libsodium'
        ],
        installCommand: (deps) => `sudo pacman -S ${deps} --noconfirm`
    },
    Fedora: {
        dependencies: [
            'openssl-devel',
            'libjpeg-turbo-devel',
            'libpng-devel',
            'gd-devel',
            'libicu',
            'libicu-devel',
            'libzip-devel',
            'libsodium',
            'libsodium-devel',
            'libtool-ltdl-devel',
            'oniguruma-devel'
        ],
        installCommand: (deps) => `sudo yum install ${deps} -y`
    },
    CentOS: {
        dependencies: [
            'openssl-devel',
            'libjpeg-turbo-devel',
            'libpng-devel',
            'gd-devel',
            'libicu',
            'libicu-devel',
            'libzip-devel',
            'libsodium',
            'libsodium-devel',
            'libtool-ltdl-devel',
            'oniguruma-devel'
        ],
        installCommand: (deps) => `sudo yum install --enablerepo=PowerTools ${deps} -y`
    },
    Ubuntu: {
        dependencies: [
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
            'libsodium-dev',
            'libsqlite3-dev',
            'libssl-dev',
            'libxml2-dev',
            ['libxslt-dev', 'libxslt1-dev'],
            'libonig-dev',
            'php-cli',
            'php-bz2',
            'pkg-config',
            'autoconf'
        ],
        installCommand: (deps) => `sudo apt-get install ${deps} -y`
    }
};

module.exports = dependenciesForPlatforms;
