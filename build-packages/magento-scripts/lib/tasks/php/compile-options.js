const compileOptions = {
    linux: {
        cpuCount: '$(nproc)',
        variants: [
            '+bz2',
            '+bcmath',
            '+ctype',
            '+curl',
            '+intl',
            '+dom',
            '+filter',
            '+hash',
            '+sockets',
            '+iconv',
            '+json',
            '+mbstring',
            '+openssl',
            '+xml',
            '+mysql',
            '+pdo',
            '+soap',
            '+xmlrpc',
            '+xml',
            '+zip',
            '+fpm',
            '+gd'
        ],
        extraOptions: [
            '--with-freetype-dir=/usr/include/freetype2',
            '--with-openssl=/usr/',
            '--with-gd=shared',
            '--with-jpeg-dir=/usr/',
            '--with-png-dir=/usr/'
        ],
        env: {
            CXX: 'g++ -DTRUE=1 -DFALSE=0',
            CC: 'gcc -DTRUE=1 -DFALSE=0'
        }
    },
    darwin: {
        cpuCount: '$(sysctl -n hw.ncpu)',
        variants: [
            '+neutral',
            '+bz2="$(brew --prefix bzip2)"',
            '+bcmath',
            '+ctype',
            '+curl=$(brew --prefix curl)',
            '+intl=$(brew --prefix icu4c)',
            '+dom',
            '+filter',
            '+hash',
            '+iconv',
            '+json',
            '+mbstring',
            '+openssl=$(brew --prefix openssl@1.1)', // ="$(brew --prefix openssl@1.1)"
            '+xml',
            '+mysql',
            '+pdo',
            '+soap',
            '+xmlrpc',
            '+xml',
            '+zip',
            '+fpm',
            '+gd'
        ],
        extraOptions: [
            '--with-zlib-dir=$(brew --prefix zlib)',
            '--with-iconv=$(brew --prefix libiconv)',
            '--with-gd=shared'
        ],
        env: {
            // eslint-disable-next-line max-len
            PKG_CONFIG_PATH: '$PKG_CONFIG_PATH:$(brew --prefix libxml2)/lib/pkgconfig:$(brew --prefix icu4c)/lib/pkgconfig:$(brew --prefix openssl@1.1)/lib/pkgconfig:$(brew --prefix curl)/lib/pkgconfig:$(brew --prefix zlib)/lib/pkgconfig',
            CPATH: '$CPATH:$(brew --prefix openssl@1.1)/include',
            CXX: 'g++ -DTRUE=1 -DFALSE=0',
            CC: 'gcc -DTRUE=1 -DFALSE=0',
            LDFLAGS: '$(brew --prefix openssl@1.1)/lib/libssl.dylib $(brew --prefix openssl@1.1)/lib/libcrypto.dylib'
        }
    }
};

module.exports = compileOptions;
