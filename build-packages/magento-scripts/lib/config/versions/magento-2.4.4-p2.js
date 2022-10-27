const { defaultMagentoConfig } = require('../magento-config')
const sodium = require('../services/php/extensions/sodium')
const {
    magento24PHPExtensionList
} = require('../magento/required-php-extensions')
const { php81 } = require('../services/php/versions')
const { sslTerminator } = require('../services/ssl-terminator')
const { varnish70 } = require('../services/varnish')
const { repo } = require('../services/php/base-repo')
const { nginx118 } = require('../services/nginx/versions')
const { composer2 } = require('../services/composer/versions')
const { maildev } = require('../services/maildev')
const { redis62 } = require('../services/redis')
const { mariadb104 } = require('../services/mariadb/versions')
const { elasticsearch716 } = require('../services/elasticsearch/versions')

/**
 * @param {Object} param0
 * @param {string} param0.templateDir
 * @returns {import('../../../typings/index').CMAConfiguration & { magentoVersion: string, isDefault?: boolean }}
 */
module.exports = ({ templateDir }) => ({
    magentoVersion: '2.4.4-p2',
    isDefault: true,
    configuration: {
        php: php81({
            templateDir,
            extensions: { ...magento24PHPExtensionList, sodium },
            baseImage: `${repo}:php-8.1-magento-2.4`
        }),
        nginx: nginx118({ templateDir }),
        redis: redis62(),
        mysql: {
            version: '8.0'
        },
        mariadb: mariadb104(),
        elasticsearch: elasticsearch716(),
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
})
