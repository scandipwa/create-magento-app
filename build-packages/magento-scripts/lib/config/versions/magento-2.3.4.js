const { elasticsearch68 } = require('../services/elasticsearch/versions');
const { defaultMagentoConfig } = require('../magento-config');
const { magento23PHPExtensionList } = require('../magento/required-php-extensions');
const { repo } = require('../php/base-repo');
const { php73 } = require('../php/versions');
const { sslTerminator } = require('../services/ssl-terminator');
const { varnish66 } = require('../varnish/varnish-6-6');
const { nginx118 } = require('../services/nginx/versions');
const { composer1 } = require('../services/composer/versions');

module.exports = ({ templateDir } = {}) => ({
    magentoVersion: '2.3.4',
    configuration: {
        php: php73({
            templateDir,
            extensions: magento23PHPExtensionList,
            baseImage: `${ repo }:php-7.3-magento-2.3`
        }),
        nginx: nginx118({ templateDir }),
        redis: {
            version: '5'
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
