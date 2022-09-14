const { defaultMagentoConfig } = require('../magento-config');
const { magento23PHPExtensionList } = require('../magento/required-php-extensions');
const { repo } = require('../php/base-repo');
const { php72 } = require('../php/versions');
const { composer1 } = require('../services/composer/versions');
const { elasticsearch68 } = require('../services/elasticsearch/versions');
const { nginx118 } = require('../services/nginx/versions');
const { sslTerminator } = require('../services/ssl-terminator');
const { varnish66 } = require('../varnish/varnish-6-6');

module.exports = ({ templateDir } = {}) => ({
    magentoVersion: '2.2.10',
    configuration: {
        php: php72({
            templateDir,
            extensions: magento23PHPExtensionList,
            baseImage: `${ repo }:php-7.2-magento-2.3`
        }),
        nginx: nginx118({ templateDir }),
        redis: {
            version: '5.0'
        },
        mysql: {
            version: '5.7'
        },
        mariadb: {
            version: '10.2'
        },
        elasticsearch: elasticsearch68(),
        composer: composer1(),
        varnish: varnish66({ templateDir }),
        sslTerminator: sslTerminator({ templateDir })
    },
    magento: defaultMagentoConfig,
    host: 'localhost',
    ssl: {
        enabled: false
    }
});