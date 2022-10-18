const pathExists = require('../../../../util/path-exists')
const {
    phpCSConfigurationPath,
    phpCSConfigFormattedPath,
    phpCSFixerConfigurationPath,
    phpCSFixerConfigurationFormattedPath
} = require('./paths')
const { nameKey, valueKey } = require('../keys')
const {
    options: { CUSTOM_RULE_SET_PATH_OPTION_NAME }
} = require('./config')

const setupCustomRuleSetPathOption = async (config) => {
    let hasChanges = false
    const customRuleSetPathOption = config.option.find(
        (option) => option[nameKey] === CUSTOM_RULE_SET_PATH_OPTION_NAME
    )
    const phpCSConfigExists = await pathExists(phpCSConfigurationPath)
    const phpCSFixerConfigPathExists = await pathExists(
        phpCSFixerConfigurationPath
    )

    if (!customRuleSetPathOption) {
        if (phpCSConfigExists) {
            hasChanges = true
            config.option.push({
                [nameKey]: CUSTOM_RULE_SET_PATH_OPTION_NAME,
                [valueKey]: phpCSConfigFormattedPath
            })
        } else if (phpCSFixerConfigPathExists) {
            hasChanges = true
            config.option.push({
                [nameKey]: CUSTOM_RULE_SET_PATH_OPTION_NAME,
                [valueKey]: phpCSFixerConfigurationFormattedPath
            })
        }
    }

    return hasChanges
}

module.exports = setupCustomRuleSetPathOption
