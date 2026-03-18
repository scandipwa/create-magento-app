const sodium = require('../services/php/extensions/sodium')
const {
    magento24PHPExtensionList
} = require('../magento/required-php-extensions')
const { php84 } = require('../services/php/versions')
const { sslTerminator } = require('../services/ssl-terminator')
const { varnish77 } = require('../services/varnish')
const { repo } = require('../services/php/base-repo')
const { nginx126 } = require('../services/nginx/versions')
const { composer29 } = require('../services/composer/versions')
const { maildev } = require('../services/maildev')
const { valkey80 } = require('../services/redis')
const { mariadb114 } = require('../services/mariadb/versions')
const { elasticsearch87 } = require('../services/elasticsearch/versions')
const { mysql84 } = require('../services/mysql/versions')
const { opensearch300 } = require('../services/opensearch/versions')

/**
 * @type {import('../../../typings/common').MagentoVersionConfigurationFunction}
 */
module.exports = ({ templateDir }) => ({
    magentoVersion: '2.4.9-beta1',
    configuration: {
        php: php84({
            templateDir,
            extensions: { ...magento24PHPExtensionList, sodium },
            baseImage: `${repo}:php-8.4-magento-2.4`
        }),
        nginx: nginx126({ templateDir }),
        redis: valkey80(),
        mysql: mysql84(),
        mariadb: mariadb114(),
        elasticsearch: elasticsearch87(),
        composer: composer29(),
        varnish: varnish77({ templateDir }),
        sslTerminator: sslTerminator({ templateDir }),
        maildev: maildev(),
        opensearch: opensearch300(),
        searchengine: 'opensearch'
    }
})
