const path = require('path');
const { defaultMagentoConfig } = require('../magento-config');
const sodium = require('../php/extensions/sodium');
const { magento24PHPExtensionList } = require('../magento/required-php-extensions');
const { php74 } = require('../php/versions');
const { sslTerminator } = require('../ssl-terminator');
const { varnish66 } = require('../varnish/varnish-6-6');
const { image } = require('../php/base-image');

module.exports = ({ templateDir } = {}) => ({
    magentoVersion: '2.4.1',
    configuration: {
        php: php74({
            templateDir,
            extensions: { ...magento24PHPExtensionList, sodium },
            baseImage: `${ image }:magento241`
        }),
        nginx: {
            version: '1.18.0',
            configTemplate: path.join(templateDir || '', 'nginx.template.conf')
        },
        redis: {
            version: '6.0.10-alpine'
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
