const path = require('path')

/**
 * @returns {import('../../../typings/index').VarnishConfiguration}
 */
const varnish66 = ({ templateDir }) => ({
    enabled: true,
    healthCheck: false,
    version: '6.6',
    configTemplate: path.join(templateDir || '', 'varnish.template.vcl')
})

module.exports = varnish66
