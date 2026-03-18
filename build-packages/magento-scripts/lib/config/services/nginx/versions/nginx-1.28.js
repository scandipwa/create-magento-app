const path = require('path')

/**
 * @param {{ templateDir: string }} param0
 * @returns {import('../../../../../typings/index').NginxConfiguration}
 */
const nginx128 = ({ templateDir }) => ({
    image: 'nginx:1.28.2',
    configTemplate: path.join(templateDir || '', 'nginx.template.conf'),
    runType: 'website'
})

module.exports = nginx128
