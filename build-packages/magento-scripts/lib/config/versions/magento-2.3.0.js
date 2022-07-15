const path = require('path');
const { defaultMagentoConfig } = require('../magento-config');
const { magento23PHPExtensionList } = require('../magento/required-php-extensions');
const { php72 } = require('../php/versions');
const { sslTerminator } = require('../ssl-terminator');
const { varnish66 } = require('../varnish/varnish-6-6');

module.exports = ({ templateDir } = {}) => ({
    magentoVersion: '2.3.0',
    configuration: {
        php: php72({
            templateDir,
            extensions: magento23PHPExtensionList
        }),
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
        varnish: varnish66({ templateDir }),
        sslTerminator: sslTerminator({ templateDir })
    },
    magento: defaultMagentoConfig,
    host: 'localhost',
    ssl: {
        enabled: false
    }
});
