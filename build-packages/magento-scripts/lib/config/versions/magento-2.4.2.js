const path = require('path');
const fs = require('fs');
const os = require('os');
const { defaultMagentoConfig } = require('../magento-config');
const pathExists = require('../../util/path-exists');

module.exports = ({ templateDir } = {}) => ({
    magentoVersion: '2.4.2',
    configuration: {
        php: {
            version: '7.4.16',
            configTemplate: path.join(templateDir || '', 'php.template.ini'),
            extensions: {
                gd: {},
                intl: {},
                zlib: {},
                openssl: {},
                sockets: {},
                SimpleXML: {},
                libsodium: {
                    moduleName: 'sodium',
                    hooks: {
                        postInstall: async ({ php }) => {
                            const sodiumDynamicLibraryPath = path.join(
                                os.homedir(),
                                '.phpbrew',
                                'php',
                                `php-${php.version}`,
                                'var',
                                'db',
                                'libsodium.ini'
                            );

                            if (!await pathExists(sodiumDynamicLibraryPath)) {
                                throw new Error(`libsodium dynamic library file configuration not found: ${sodiumDynamicLibraryPath}`);
                            }
                            const fileContent = await fs.promises.readFile(sodiumDynamicLibraryPath, 'utf-8');

                            if (/^extension=libsodium\.so$/.test(fileContent.trim())) {
                                await fs.promises.writeFile(
                                    sodiumDynamicLibraryPath,
                                    'extension=sodium.so\n',
                                    'utf-8'
                                );
                            }
                        }
                    }
                },
                fileinfo: {},
                xdebug: {
                    version: '3.0.4'
                }
            }
        },
        nginx: {
            version: '1.18.0',
            configTemplate: path.join(templateDir || '', 'nginx.template.conf')
        },
        redis: {
            version: '6.0'
        },
        mysql: {
            version: '8.0'
        },
        elasticsearch: {
            version: '7.9.3'
        },
        composer: {
            version: '2'
        }
    },
    magento: defaultMagentoConfig,
    host: 'localhost',
    ssl: {
        enabled: false
    }
});
