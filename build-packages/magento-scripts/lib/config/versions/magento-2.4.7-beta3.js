const sodium = require('../services/php/extensions/sodium')
const {
    magento24PHPExtensionList
} = require('../magento/required-php-extensions')
const { php82 } = require('../services/php/versions')
const { sslTerminator } = require('../services/ssl-terminator')
const { varnish74 } = require('../services/varnish')
const { repo } = require('../services/php/base-repo')
const { nginx118 } = require('../services/nginx/versions')
const { composer26 } = require('../services/composer/versions')
const { maildev } = require('../services/maildev')
const { redis72 } = require('../services/redis')
const { mariadb106 } = require('../services/mariadb/versions')
const { elasticsearch811 } = require('../services/elasticsearch/versions')
const { mysql80 } = require('../services/mysql/versions')
const { opensearch25 } = require('../services/opensearch/versions')

/**
 * @type {import('../../../typings/common').MagentoVersionConfigurationFunction}
 */
module.exports = ({ templateDir }) => ({
    magentoVersion: '2.4.7-beta3',
    configuration: {
        php: php82({
            templateDir,
            extensions: { ...magento24PHPExtensionList, sodium },
            baseImage: `${repo}:php-8.2-magento-2.4`
        }),
        nginx: nginx118({ templateDir }),
        redis: redis72(),
        mysql: mysql80(),
        mariadb: mariadb106(),
        elasticsearch: elasticsearch811(),
        composer: composer26(),
        varnish: varnish74({ templateDir }),
        sslTerminator: sslTerminator({ templateDir }),
        maildev: maildev(),
        opensearch: opensearch25()
    }
})
