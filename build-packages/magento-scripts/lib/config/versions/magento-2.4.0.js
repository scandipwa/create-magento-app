const { defaultMagentoConfig } = require('../magento-config');
const { magento24PHPExtensionList } = require('../magento/required-php-extensions');
const { repo } = require('../php/base-repo');
const { php74 } = require('../php/versions');
const { composer1 } = require('../services/composer/versions');
const { maildev } = require('../services/maildev');
const { nginx118 } = require('../services/nginx/versions');
const { sslTerminator } = require('../services/ssl-terminator');
const { varnish60 } = require('../varnish/varnish-6-0');

module.exports = ({ templateDir } = {}) => ({
    magentoVersion: '2.4.0',
    configuration: {
        php: php74({
            templateDir,
            extensions: magento24PHPExtensionList,
            baseImage: `${ repo }:php-7.4-magento-2.4`
        }),
        nginx: nginx118({ templateDir }),
        redis: {
            version: '5'
        },
        mysql: {
            version: '8.0'
        },
        mariadb: {
            version: '10.2'
        },
        elasticsearch: {
            version: '7.12.1'
        },
        composer: composer1(),
        varnish: varnish60({ templateDir }),
        sslTerminator: sslTerminator({ templateDir }),
        maildev: maildev()
    },
    magento: defaultMagentoConfig,
    host: 'localhost',
    ssl: {
        enabled: false
    }
});
