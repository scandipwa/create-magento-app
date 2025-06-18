const sodium = require('../services/php/extensions/sodium')
const {
    magento24PHPExtensionList
} = require('../magento/required-php-extensions')
const { php82 } = require('../services/php/versions')
const { sslTerminator } = require('../services/ssl-terminator')
const { varnish76 } = require('../services/varnish')
const { repo } = require('../services/php/base-repo')
const { nginx126 } = require('../services/nginx/versions')
const { composer28 } = require('../services/composer/versions')
const { maildev } = require('../services/maildev')
const { redis72 } = require('../services/redis')
const { mariadb1011 } = require('../services/mariadb/versions')
const { elasticsearch817 } = require('../services/elasticsearch/versions')
const { mysql80 } = require('../services/mysql/versions')
const { opensearch219 } = require('../services/opensearch/versions')

/**
 * @type {import('../../../typings/common').MagentoVersionConfigurationFunction}
 */
module.exports = ({ templateDir }) => ({
    magentoVersion: '2.4.7-p6',
    configuration: {
        php: php82({
            templateDir,
            extensions: { ...magento24PHPExtensionList, sodium },
            baseImage: `${repo}:php-8.2-magento-2.4`
        }),
        nginx: nginx126({ templateDir }),
        redis: redis72(),
        mysql: mysql80(),
        mariadb: mariadb1011(),
        elasticsearch: elasticsearch817(),
        composer: composer28(),
        varnish: varnish76({ templateDir }),
        sslTerminator: sslTerminator({ templateDir }),
        maildev: maildev(),
        opensearch: opensearch219(),
        searchengine: 'opensearch'
    }
})
