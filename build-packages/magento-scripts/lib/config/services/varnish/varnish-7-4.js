const path = require('path')

/**
 * @param {Object} param0
 * @param {string} param0.templateDir
 * @returns {import('../../../../typings/index').VarnishConfiguration}
 */
const varnish74 = ({ templateDir }) => ({
    enabled: false,
    healthCheck: false,
    image: 'varnish:7.4',
    configTemplate: path.join(templateDir || '', 'varnish.template.vcl')
})

module.exports = varnish74
