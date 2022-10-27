const { nameKey, valueKey } = require('../keys')
const {
    options: {
        CODING_STANDARD_OPTION_NAME,
        CUSTOM_CODING_STANDARD_OPTION_VALUE
    }
} = require('./config')

const setupCodingStandardOption = async (config) => {
    let hasChanges = false
    const codingStandardOption = config.option.find(
        (option) => option[nameKey] === CODING_STANDARD_OPTION_NAME
    )

    if (!codingStandardOption) {
        hasChanges = true
        config.option.push({
            [nameKey]: CODING_STANDARD_OPTION_NAME,
            [valueKey]: CUSTOM_CODING_STANDARD_OPTION_VALUE
        })
    }

    return hasChanges
}

module.exports = setupCodingStandardOption
