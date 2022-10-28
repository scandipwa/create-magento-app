const path = require('path')

/**
 * @param {Object} param0
 * @param {string} param0.templateDir
 * @returns {import('../../../../typings/index').VarnishConfiguration}
 */
const varnish70 = ({ templateDir }) => ({
    enabled: true,
    healthCheck: false,
    image: 'varnish:7.0',
    configTemplate: path.join(templateDir || '', 'varnish.template.vcl')
})

module.exports = varnish70
