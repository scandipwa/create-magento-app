const path = require('path');
const { defaultMagentoConfig } = require('../magento-config');

module.exports = ({ templateDir } = {}) => ({
    magentoVersion: '2.3.0',
    configuration: {
        php: {
            version: '7.2.33',
            configTemplate: path.join(templateDir || '', 'php.template.ini'),
            extensions: {
                gd: {
                    macosOptions: '--with-zlib-dir=$(brew --prefix zlib) --with-freetype-dir=$(brew --prefix freetype)'
                },
                intl: {},
                zlib: {},
                openssl: {},
                sockets: {},
                SimpleXML: {},
                xdebug: {
                    version: '3.1.2'
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
            version: '5.0'
        },
        mysql: {
            version: '5.7'
        },
        mariadb: {
            version: '10.2'
        },
        elasticsearch: {
            version: '5.6.16'
        },
        composer: {
            version: '1'
        },
        varnish: {
            enabled: true,
            version: '5',
            configTemplate: path.join(templateDir || '', 'varnish.template.vcl')
        }
    },
    magento: defaultMagentoConfig,
    host: 'localhost',
    ssl: {
        enabled: false
    }
});
