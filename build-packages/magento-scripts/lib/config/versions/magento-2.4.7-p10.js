const sodium = require('../services/php/extensions/sodium')
const {
    magento24PHPExtensionList
} = require('../magento/required-php-extensions')
const { php82 } = require('../services/php/versions')
const { sslTerminator } = require('../services/ssl-terminator')
const { varnish80 } = require('../services/varnish')
const { repo } = require('../services/php/base-repo')
const { nginx128 } = require('../services/nginx/versions')
const { composer29 } = require('../services/composer/versions')
const { maildev } = require('../services/maildev')
const { valkey81 } = require('../services/redis')
const { mariadb1011 } = require('../services/mariadb/versions')
const { elasticsearch817 } = require('../services/elasticsearch/versions')
const { mysql80 } = require('../services/mysql/versions')
const { opensearch219 } = require('../services/opensearch/versions')

/**
 * @type {import('../../../typings/common').MagentoVersionConfigurationFunction}
 */
module.exports = ({ templateDir }) => ({
    magentoVersion: '2.4.7-p10',
    configuration: {
        php: php82({
            templateDir,
            extensions: { ...magento24PHPExtensionList, sodium },
            baseImage: `${repo}:php-8.2-magento-2.4`
        }),
        nginx: nginx128({ templateDir }),
        redis: valkey81(),
        // not supported anymore
        mysql: mysql80(),
        mariadb: mariadb1011(),
        elasticsearch: elasticsearch817(),
        composer: composer29(),
        varnish: varnish80({ templateDir }),
        sslTerminator: sslTerminator({ templateDir }),
        maildev: maildev(),
        opensearch: opensearch219(),
        searchengine: 'opensearch'
    }
})
