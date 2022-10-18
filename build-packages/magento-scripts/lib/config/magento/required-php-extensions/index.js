const magento23RequiredPHPExtensions = require('./magento-2.3')
const magento24RequiredPHPExtensions = require('./magento-2.4')

const {
    phpExtensionInstallationInstructions
} = require('../../services/php/extensions')

/**
 * @param {string[]} requiredPHPExtensions
 * @returns {Record<string, import('../../../../typings/index').PHPExtensionInstallationInstruction>}
 */
const mapMagentoRequiredExtensionsToInstructions = (requiredPHPExtensions) =>
    requiredPHPExtensions
        .map((extensionName) => {
            if (phpExtensionInstallationInstructions[extensionName]) {
                return phpExtensionInstallationInstructions[extensionName]
            }

            for (const [extensionName, extensionData] of Object.entries(
                phpExtensionInstallationInstructions
            )) {
                if (
                    extensionData.alternativeName &&
                    extensionData.alternativeName.includes(extensionName)
                ) {
                    return extensionData
                }
            }

            return {
                name: extensionName
            }
        })
        .reduce((acc, val) => ({ ...acc, [val.name]: val }), {})

module.exports = {
    magento23PHPExtensionList: mapMagentoRequiredExtensionsToInstructions(
        magento23RequiredPHPExtensions
    ),
    magento24PHPExtensionList: mapMagentoRequiredExtensionsToInstructions(
        magento24RequiredPHPExtensions
    )
}
