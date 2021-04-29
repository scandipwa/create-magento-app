const path = require('path');
const { defaultMagentoConfig } = require('../magento-config');
const { libsodium } = require('../php/extensions');

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
                libsodium,
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
        mariadb: {
            version: '10.4'
        },
        elasticsearch: {
            version: '7.12.1'
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
