const { defaultMagentoConfig } = require('../magento-config');
const { defaultPorts } = require('../port-config');

module.exports = (config = {}) => ({
    magentoVersion: '2.4.1',
    configuration: {
        php: {
            version: '7.4.13',
            configFile: 'default',
            extensions: {
                gd: {
                    name: 'gd'
                },
                intl: {
                    name: 'intl'
                },
                zlib: {
                    name: 'zlib'
                },
                openssl: {
                    name: 'openssl'
                },
                sockets: {
                    name: 'sockets'
                },
                simpleXML: {
                    name: 'SimpleXML'
                },
                xdebug: {
                    name: 'xdebug',
                    version: '3.0.2'
                }
            }
        },
        nginx: {
            version: '1.18.0',
            configFile: 'default',
            config: {
                volume: {
                    name: `${config.prefix}_nginx-data`,
                    opts: {
                        type: 'nfs',
                        device: `${config.cacheDir}/nginx/conf.d`,
                        o: 'bind'
                    }
                }
            }
        },
        redis: {
            version: 'alpine'
        },
        mysql: {
            version: '8.0'
        },
        elasticsearch: {
            version: '7.6.2',
            config: {
                env: {
                    'bootstrap.memory_lock': true,
                    'xpack.security.enabled': false,
                    'discovery.type': 'single-node',
                    ES_JAVA_OPTS: '"-Xms512m -Xmx512m"',
                    'xpack.ml.enabled': false
                }
            }
        },
        composer: {
            version: '1'
        }
    },
    magento: defaultMagentoConfig,
    ports: defaultPorts
});
