const path = require('path');
const { defaultMagentoConfig } = require('../magento-config');
const { libsodium } = require('../php/extensions');
const { php7430 } = require('../php/releases');
const { sslTerminator } = require('../ssl-terminator');
const { varnish66 } = require('../varnish/varnish-6-6');

module.exports = ({ templateDir } = {}) => ({
    magentoVersion: '2.4.2-p2',
    isDefault: true,
    configuration: {
        php: php7430({
            templateDir,
            additionalExtensions: {
                libsodium,
                fileinfo: {}
            }
        }),
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
        },
        varnish: varnish66({ templateDir }),
        sslTerminator: sslTerminator({ templateDir })
    },
    magento: defaultMagentoConfig,
    host: 'localhost',
    ssl: {
        enabled: false
    }
});
