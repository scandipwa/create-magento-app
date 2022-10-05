const { defaultMagentoConfig } = require('../magento-config');
const sodium = require('../php/extensions/sodium');
const { magento24PHPExtensionList } = require('../magento/required-php-extensions');
const { php81 } = require('../php/versions');
const { sslTerminator } = require('../services/ssl-terminator');
const { varnish70 } = require('../varnish/varnish-7-0');
const { repo } = require('../php/base-repo');
const { nginx118 } = require('../services/nginx/versions');
const { composer2 } = require('../services/composer/versions');
const { maildev } = require('../services/maildev');

module.exports = ({ templateDir } = {}) => ({
    magentoVersion: '2.4.4-p1',
    isDefault: true,
    configuration: {
        php: php81({
            templateDir,
            extensions: { ...magento24PHPExtensionList, sodium },
            baseImage: `${ repo }:php-8.1-magento-2.4`
        }),
        nginx: nginx118({ templateDir }),
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
        composer: composer2(),
        varnish: varnish70({ templateDir }),
        sslTerminator: sslTerminator({ templateDir }),
        maildev: maildev()
    },
    magento: defaultMagentoConfig,
    host: 'localhost',
    ssl: {
        enabled: false
    }
});
