const path = require('path');
const { defaultMagentoConfig } = require('../magento-config');
const sodium = require('../magento/instructions-for-php-extensions/sodium');
const { magento24PHPExtensionList } = require('../magento/required-php-extensions');
const { php81 } = require('../php/versions');
const { sslTerminator } = require('../ssl-terminator');
const { varnish70 } = require('../varnish/varnish-7-0');

module.exports = ({ templateDir } = {}) => ({
    magentoVersion: '2.4.4',
    isDefault: true,
    configuration: {
        php: php81({ templateDir, extensions: { ...magento24PHPExtensionList, sodium } }),
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
        varnish: varnish70({ templateDir }),
        sslTerminator: sslTerminator({ templateDir })
    },
    magento: defaultMagentoConfig,
    host: 'localhost',
    ssl: {
        enabled: false
    }
});
