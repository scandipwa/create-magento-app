const path = require('path');
const { defaultMagentoConfig } = require('../magento-config');

module.exports = ({ templateDir } = {}) => ({
    magentoVersion: '2.3.7-p3',
    configuration: {
        php: {
            version: '7.4.27',
            configTemplate: path.join(templateDir || '', 'php.template.ini'),
            extensions: {
                gd: {},
                intl: {},
                zlib: {},
                openssl: {},
                sockets: {},
                SimpleXML: {},
                xdebug: {
                    version: '3.1.2'
                }
            }
        },
        nginx: {
            version: '1.18.0',
            configTemplate: path.join(templateDir || '', 'nginx.template.conf')
        },
        redis: {
            version: '6'
        },
        mysql: {
            version: '5.7'
        },
        mariadb: {
            version: '10.2'
        },
        elasticsearch: {
            version: '7.9.3'
        },
        composer: {
            version: '2'
        },
        varnish: {
            enabled: true,
            version: '6.5',
            configTemplate: path.join(templateDir || '', 'varnish.template.vcl')
        }
    },
    magento: defaultMagentoConfig,
    host: 'localhost',
    ssl: {
        enabled: false
    }
});
