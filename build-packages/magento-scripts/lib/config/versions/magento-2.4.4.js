const path = require('path');
const { defaultMagentoConfig } = require('../magento-config');
const { libsodium } = require('../php/extensions');
const { varnish70 } = require('../varnish/varnish-7-0');

module.exports = ({ templateDir } = {}) => ({
    magentoVersion: '2.4.4',
    isDefault: true,
    configuration: {
        php: {
            version: '8.1.4',
            configTemplate: path.join(templateDir || '', 'php.template.ini'),
            extensions: {
                gd: {},
                intl: {},
                zlib: {},
                openssl: {},
                sockets: {},
                SimpleXML: {},
                libsodium,
                fileinfo: {},
                xdebug: {
                    version: '3.1.4'
                },
                apcu: {},
                opcache: {
                    extensionName: 'Zend OPcache'
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
        mariadb: {
            version: '10.4'
        },
        elasticsearch: {
            version: '7.16.3'
        },
        composer: {
            version: '2'
        },
        varnish: varnish70({ templateDir })
    },
    magento: defaultMagentoConfig,
    host: 'localhost',
    ssl: {
        enabled: false
    }
});
