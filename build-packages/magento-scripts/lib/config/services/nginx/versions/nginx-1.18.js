const path = require('path');

/**
 * @returns {import('../../../../../typings/index').NginxConfiguration}
 */
const nginx118 = ({ templateDir }) => ({
    version: '1.18.0',
    configTemplate: path.join(templateDir || '', 'nginx.template.conf')
});

module.exports = nginx118;
