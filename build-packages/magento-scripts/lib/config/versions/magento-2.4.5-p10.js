const sodium = require('../services/php/extensions/sodium')
const {
    magento24PHPExtensionList
} = require('../magento/required-php-extensions')
const { php81 } = require('../services/php/versions')
const { sslTerminator } = require('../services/ssl-terminator')
const { varnish73 } = require('../services/varnish')
const { repo } = require('../services/php/base-repo')
const { nginx124 } = require('../services/nginx/versions')
const { composer22 } = require('../services/composer/versions')
const { maildev } = require('../services/maildev')
const { redis70 } = require('../services/redis')
const { mariadb104 } = require('../services/mariadb/versions')
const { elasticsearch717 } = require('../services/elasticsearch/versions')
const { mysql80 } = require('../services/mysql/versions')
const { opensearch13 } = require('../services/opensearch/versions')

/**
 * @type {import('../../../typings/common').MagentoVersionConfigurationFunction}
 */
module.exports = ({ templateDir }) => ({
    magentoVersion: '2.4.5-p10',
    configuration: {
        php: php81({
            templateDir,
            extensions: { ...magento24PHPExtensionList, sodium },
            baseImage: `${repo}:php-8.1-magento-2.4`
        }),
        nginx: nginx124({ templateDir }),
        redis: redis70(),
        mysql: mysql80(),
        mariadb: mariadb104(),
        elasticsearch: elasticsearch717(),
        composer: composer22(),
        varnish: varnish73({ templateDir }),
        sslTerminator: sslTerminator({ templateDir }),
        maildev: maildev(),
        opensearch: opensearch13()
    }
})
