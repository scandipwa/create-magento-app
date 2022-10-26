const path = require('path')

/**
 * @param {{ templateDir: string }} param0
 * @returns {import('../../../../../typings/index').NginxConfiguration}
 */
const nginx118 = ({ templateDir }) => ({
    image: 'nginx:1.18.0',
    configTemplate: path.join(templateDir || '', 'nginx.template.conf')
})

module.exports = nginx118
