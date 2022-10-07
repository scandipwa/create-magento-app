const path = require('path');

/**
 * @returns {import('../../../typings/index').VarnishConfiguration}
 */
const varnish60 = ({ templateDir }) => ({
    enabled: true,
    healthCheck: false,
    version: '6.0',
    configTemplate: path.join(templateDir || '', 'varnish.template.vcl')
});

module.exports = varnish60;
