const { defaultMagentoConfig } = require('../magento-config');
const { magento23PHPExtensionList } = require('../magento/required-php-extensions');
const { repo } = require('../services/php/base-repo');
const { php73 } = require('../services/php/versions');
const { composer1 } = require('../services/composer/versions');
const { maildev } = require('../services/maildev');
const { nginx118 } = require('../services/nginx/versions');
const { redis50 } = require('../services/redis');
const { sslTerminator } = require('../services/ssl-terminator');
const { varnish66 } = require('../services/varnish');

module.exports = ({ templateDir } = {}) => ({
    magentoVersion: '2.3.6',
    configuration: {
        php: php73({
            templateDir,
            extensions: magento23PHPExtensionList,
            baseImage: `${ repo }:php-7.3-magento-2.3`
        }),
        nginx: nginx118({ templateDir }),
        redis: redis50(),
        mysql: {
            version: '5.7'
        },
        mariadb: {
            version: '10.2'
        },
        elasticsearch: {
            version: '7.7.1'
        },
        composer: composer1(),
        varnish: varnish66({ templateDir }),
        sslTerminator: sslTerminator({ templateDir }),
        maildev: maildev()
    },
    magento: defaultMagentoConfig,
    host: 'localhost',
    ssl: {
        enabled: false
    }
});
