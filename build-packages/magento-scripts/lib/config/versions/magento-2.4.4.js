const path = require('path');
const { defaultMagentoConfig } = require('../magento-config');
const { libsodium } = require('../php/extensions');

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
        varnish: {
            enabled: true,
            version: '7.0',
            configTemplate: path.join(templateDir || '', 'varnish.template.vcl')
        }
    },
    magento: defaultMagentoConfig,
    host: 'localhost',
    ssl: {
        enabled: false
    }
});
