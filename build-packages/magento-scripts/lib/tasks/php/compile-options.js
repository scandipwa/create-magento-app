const { bundledExtensions } = require('./bundled-extensions');

const darwinVariants = [
    'openssl=$(brew --prefix openssl@1.1)', // ="$(brew --prefix openssl@1.1)"
    'curl=$(brew --prefix curl)',
    'intl=$(brew --prefix icu4c)',
    'bz2="$(brew --prefix bzip2)"'
];

const compileOptions = {
    linux: {
        cpuCount: '$(nproc)',
        variants: bundledExtensions.map((ext) => `+${ext}`),
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
        variants: bundledExtensions.map((ext) => {
            const darwinVariant = darwinVariants.find((dv) => dv.startsWith(ext));
            if (darwinVariant) {
                return `+${darwinVariant}`;
            }

            return `+${ext}`;
        }),
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
            LDFLAGS: '$(brew --prefix openssl@1.1)/lib/libssl.dylib $(brew --prefix openssl@1.1)/lib/libcrypto.dylib',
            CFLAGS: '-Wno-implicit-function-declaration' // https://github.com/phpbrew/phpbrew/issues/1222
        }
    }
};

module.exports = compileOptions;
