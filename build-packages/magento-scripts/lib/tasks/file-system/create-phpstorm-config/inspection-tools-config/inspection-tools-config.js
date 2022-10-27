const path = require('path')
const { baseConfig } = require('../../../../config')

const getInspectionToolsConfig = () => ({
    path: path.join(
        process.cwd(),
        '.idea',
        'inspectionProfiles',
        'Project_Default.xml'
    ),
    templatePath: path.join(
        baseConfig.templateDir,
        'Project_Default.template.xml'
    )
})

module.exports = {
    getInspectionToolsConfig
}
