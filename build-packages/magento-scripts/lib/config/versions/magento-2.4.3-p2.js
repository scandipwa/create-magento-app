const path = require('path');
const { defaultMagentoConfig } = require('../magento-config');
const sodium = require('../magento/instructions-for-php-extensions/sodium');
const { magento24PHPExtensionList } = require('../magento/required-php-extensions');
const { php74 } = require('../php/versions');
const { sslTerminator } = require('../ssl-terminator');
const { varnish66 } = require('../varnish/varnish-6-6');

module.exports = ({ templateDir } = {}) => ({
    magentoVersion: '2.4.3-p2',
    isDefault: true,
    configuration: {
        php: php74({ templateDir, extensions: { ...magento24PHPExtensionList, sodium } }),
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
