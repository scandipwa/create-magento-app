const path = require('path')
const { formatPathForPHPStormConfig } = require('../xml-utils')

const phpCompatibilityPath = path.join(
    process.cwd(),
    'vendor',
    'phpcompatibility',
    'php-compatibility',
    'PHPCompatibility'
)
const phpCompatibilityRuleSetPath = path.join(
    phpCompatibilityPath,
    'ruleset.xml'
)
const phpCompatibilityFormattedPath =
    formatPathForPHPStormConfig(phpCompatibilityPath)
const phpCSConfigurationPath = path.join(process.cwd(), '.php_cs.dist')
const phpCSConfigFormattedPath = formatPathForPHPStormConfig(
    phpCSConfigurationPath
)
const phpCSFixerConfigurationPath = path.join(
    process.cwd(),
    '.php-cs-fixer.dist.php'
)
const phpCSFixerConfigurationFormattedPath = formatPathForPHPStormConfig(
    phpCSFixerConfigurationPath
)
const phpMDRuleSetPath = path.join(
    process.cwd(),
    'dev',
    'tests',
    'static',
    'testsuite',
    'Magento',
    'Test',
    'Php',
    '_files',
    'phpmd',
    'ruleset.xml'
)
const phpMDRuleSetFormattedPath = formatPathForPHPStormConfig(phpMDRuleSetPath)

module.exports = {
    phpCompatibilityPath,
    phpCompatibilityRuleSetPath,
    phpCompatibilityFormattedPath,
    phpCSConfigurationPath,
    phpCSConfigFormattedPath,
    phpCSFixerConfigurationPath,
    phpCSFixerConfigurationFormattedPath,
    phpMDRuleSetPath,
    phpMDRuleSetFormattedPath
}
