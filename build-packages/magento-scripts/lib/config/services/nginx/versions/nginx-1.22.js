const path = require('path')

/**
 * @param {{ templateDir: string }} param0
 * @returns {import('../../../../../typings/index').NginxConfiguration}
 */
const nginx122 = ({ templateDir }) => ({
    image: 'nginx:1.22.1',
    configTemplate: path.join(templateDir || '', 'nginx.template.conf'),
    runType: 'website'
})

module.exports = nginx122
