const path = require('path')

/**
 * @param {{ templateDir: string }} param0
 * @returns {import('../../../../../typings/index').NginxConfiguration}
 */
const nginx126 = ({ templateDir }) => ({
    image: 'nginx:1.26.0',
    configTemplate: path.join(templateDir || '', 'nginx.template.conf')
})

module.exports = nginx126
