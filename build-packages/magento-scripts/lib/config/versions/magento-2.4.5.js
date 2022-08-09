const path = require('path');
const { defaultMagentoConfig } = require('../magento-config');
const sodium = require('../php/extensions/sodium');
const { magento24PHPExtensionList } = require('../magento/required-php-extensions');
const { php81 } = require('../php/versions');
const { sslTerminator } = require('../ssl-terminator');
const { varnish70 } = require('../varnish/varnish-7-0');
const { repo } = require('../php/base-repo');

module.exports = ({ templateDir } = {}) => ({
    magentoVersion: '2.4.5',
    isDefault: true,
    configuration: {
        php: php81({
            templateDir,
            extensions: { ...magento24PHPExtensionList, sodium },
            baseImage: `${ repo }:php-8.1-magento-2.4`
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
            version: '7.17.5'
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
