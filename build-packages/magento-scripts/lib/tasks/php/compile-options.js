/* eslint-disable max-len */
const { getBrewCommandSync, getBrewBinPathSync } = require('../../util/get-brew-bin-path');
const { bundledExtensions } = require('./bundled-extensions');

const darwinVariants = [
    `openssl=$(${getBrewCommandSync()} --prefix openssl@1.1)`, // ="$(brew --prefix openssl@1.1)"
    `curl=$(${getBrewCommandSync()} --prefix curl)`,
    `intl=$(${getBrewCommandSync()} --prefix icu4c)`,
    `bz2="$(${getBrewCommandSync()} --prefix bzip2)"`
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
            `--with-zlib-dir=$(${getBrewCommandSync()} --prefix zlib)`,
            `--with-iconv=$(${getBrewCommandSync()} --prefix libiconv)`,
            '--with-gd=shared'
        ],
        env: {
            // eslint-disable-next-line max-len
            PKG_CONFIG_PATH: `$PKG_CONFIG_PATH:$(${getBrewCommandSync()} --prefix libxml2)/lib/pkgconfig:$(${getBrewCommandSync()} --prefix icu4c)/lib/pkgconfig:$(${getBrewCommandSync()} --prefix openssl@1.1)/lib/pkgconfig:$(${getBrewCommandSync()} --prefix curl)/lib/pkgconfig:$(${getBrewCommandSync()} --prefix zlib)/lib/pkgconfig`,
            CPATH: `$CPATH:$(${getBrewCommandSync()} --prefix openssl@1.1)/include`,
            CXX: 'g++ -DTRUE=1 -DFALSE=0',
            CC: 'gcc -DTRUE=1 -DFALSE=0',
            LDFLAGS: `$(${getBrewCommandSync()} --prefix openssl@1.1)/lib/libssl.dylib $(${getBrewCommandSync()} --prefix openssl@1.1)/lib/libcrypto.dylib`,
            CFLAGS: '-Wno-implicit-function-declaration', // https://github.com/phpbrew/phpbrew/issues/1222
            PATH: `${getBrewBinPathSync().replace('/brew', '')}:${process.env.PATH}`
        }
    }
};

module.exports = compileOptions;
